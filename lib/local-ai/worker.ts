import { env, pipeline, type TextGenerationPipeline } from "@huggingface/transformers";
import { LAB_CACHE, LOCAL_MODEL } from "./config";
import { parserPrompt } from "./contract";

let generator: TextGenerationPipeline | null = null;
let busy = false;
let offlineOnly = false;
const emptyMetrics = () => ({ networkRequests: 0, downloadedBodyBytes: 0, modelBodyBytes: 0, runtimeBodyBytes: 0, downloadWallMs: 0, cacheHits: 0, cacheWrites: 0, cacheErrors: 0 });
let metrics = emptyMetrics();
let firstDownloadAt: number | null = null;
let cacheProblems: string[] = [];
const send = (value: unknown) => self.postMessage(value);
const nativeFetch = globalThis.fetch.bind(globalThis);

env.allowLocalModels = false;
// The pipeline's preliminary config discovery may omit revision; pin the URL too.
env.remotePathTemplate = `{model}/resolve/${LOCAL_MODEL.revision}/`;
env.useFSCache = false;
env.useBrowserCache = false;
env.useCustomCache = true;
env.customCache = {
  async match(request) {
    try {
      const response = await (await caches.open(LAB_CACHE)).match(request);
      if (response) metrics.cacheHits++;
      return response;
    } catch (error) { metrics.cacheErrors++; cacheProblems.push(`read: ${String(error).slice(0, 160)}`); return undefined; }
  },
  async put(request, response) {
    try { await (await caches.open(LAB_CACHE)).put(request, response); metrics.cacheWrites++; }
    catch (error) { metrics.cacheErrors++; cacheProblems.push(`write: ${String(error).slice(0, 160)}`); }
  },
};
env.fetch = async (input, init) => {
  if (offlineOnly) throw new Error("CACHE_ONLY_MISS");
  if (init?.body || (init?.method && !["GET", "HEAD"].includes(init.method))) throw new Error("ASSET_GET_ONLY");
  const url = new URL(String(input));
  const isModel = url.origin === "https://huggingface.co" && url.pathname.startsWith(`/${LOCAL_MODEL.id}/resolve/${LOCAL_MODEL.revision}/`);
  const isRuntime = url.origin === "https://cdn.jsdelivr.net" && url.pathname.startsWith("/npm/onnxruntime-web@1.31.0-dev.20260914-8d85527a0/dist/");
  if (!isModel && !isRuntime) throw new Error(`UNEXPECTED_ASSET_REQUEST: ${url.origin}${url.pathname}`);
  metrics.networkRequests++;
  firstDownloadAt ??= performance.now();
  const response = await nativeFetch(input, init);
  if (!response.body) return response;
  const reader = response.body.getReader();
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const chunk = await reader.read();
        if (chunk.done) { controller.close(); return; }
        metrics.downloadedBodyBytes += chunk.value.byteLength;
        if (isModel) metrics.modelBodyBytes += chunk.value.byteLength;
        else metrics.runtimeBodyBytes += chunk.value.byteLength;
        metrics.downloadWallMs = performance.now() - firstDownloadAt!;
        controller.enqueue(chunk.value);
      } catch (error) { controller.error(error); }
    },
    cancel(reason) { return reader.cancel(reason); },
  });
  return new Response(body, { status: response.status, statusText: response.statusText, headers: response.headers });
};

self.onmessage = async (event: MessageEvent<{ id: number; type: "load" | "parse"; text?: string; today?: string; offlineOnly?: boolean }>) => {
  const { id, type } = event.data;
  if (busy) { send({ id, type: "error", error: "BUSY" }); return; }
  busy = true;
  const started = performance.now();
  try {
    if (type === "load") {
      offlineOnly = !!event.data.offlineOnly;
      metrics = emptyMetrics();
      firstDownloadAt = null;
      cacheProblems = [];
      generator = await pipeline("text-generation", LOCAL_MODEL.id, {
        device: "webgpu", dtype: LOCAL_MODEL.dtype, revision: LOCAL_MODEL.revision,
        progress_callback: (progress) => send({ id, type: "progress", progress, metrics }),
      });
      send({ id, type: "loaded", ms: performance.now() - started, metrics, cacheProblems, offlineOnly });
    } else {
      if (!generator || !event.data.text || !event.data.today) throw Error("MODEL_NOT_READY");
      const output = await generator([{ role: "user", content: parserPrompt(event.data.text, event.data.today) }], {
        max_new_tokens: 768, do_sample: false, return_full_text: false,
      });
      const first = output[0];
      if (!first || !("generated_text" in first)) throw Error("MODEL_OUTPUT_MISSING");
      const generated = first.generated_text;
      const raw = typeof generated === "string" ? generated : generated.at(-1)?.content;
      if (typeof raw !== "string") throw Error("MODEL_OUTPUT_NOT_TEXT");
      send({ id, type: "parsed", raw, ms: performance.now() - started });
    }
  } catch (error) {
    send({ id, type: "error", operation: type, error: error instanceof Error ? error.message.slice(0, 600) : "LOCAL_INFERENCE_FAILED", ms: performance.now() - started, metrics, cacheProblems });
  } finally { busy = false; }
};
