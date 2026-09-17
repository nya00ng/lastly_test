type ProbeGpu = { requestAdapter(): Promise<null | { info?: { vendor: string; architecture: string; device: string; description: string }; features: Iterable<string>; limits: { maxBufferSize: number; maxStorageBufferBindingSize: number }; requestDevice(): Promise<{ destroy(): void }> }> };
type ExtendedNavigator = Navigator & { gpu?: ProbeGpu; deviceMemory?: number };

async function attempt(operation: () => Promise<unknown> | unknown) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      Promise.resolve().then(operation),
      new Promise((_, reject) => { timer = setTimeout(() => reject(Error("CAPABILITY_TIMEOUT")), 5000); }),
    ]);
    return true;
  } catch { return false; }
  finally { clearTimeout(timer); }
}

export async function probeCapabilities() {
  const nav = navigator as ExtendedNavigator;
  let adapter = false;
  let device = false;
  let features: string[] = [];
  let limits: Record<string, number> | null = null;
  let gpuInfo: Record<string, string> | null = null;
  await attempt(async () => {
    const gpuAdapter = await nav.gpu?.requestAdapter();
    adapter = !!gpuAdapter;
    if (!gpuAdapter) return;
    features = Array.from(gpuAdapter.features);
    if (gpuAdapter.info) gpuInfo = { vendor: gpuAdapter.info.vendor, architecture: gpuAdapter.info.architecture, device: gpuAdapter.info.device, description: gpuAdapter.info.description };
    limits = { maxBufferSize: gpuAdapter.limits.maxBufferSize, maxStorageBufferBindingSize: gpuAdapter.limits.maxStorageBufferBindingSize };
    const gpuDevice = await gpuAdapter.requestDevice();
    device = true;
    gpuDevice.destroy();
  });
  const key = `lastly-probe-${crypto.randomUUID()}`;
  const localStorage = await attempt(() => { window.localStorage.setItem(key, key); if (window.localStorage.getItem(key) !== key) throw Error(); window.localStorage.removeItem(key); });
  const cacheStorage = await attempt(async () => {
    const cache = await caches.open(key);
    try { await cache.put(new URL(`/__${key}`, location.origin), new Response(key)); if (!await cache.match(new URL(`/__${key}`, location.origin))) throw Error(); }
    finally { await caches.delete(key); }
  });
  const indexedDB = await attempt(() => new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(Error("IDB timeout")), 4000);
    const request = window.indexedDB.open(key, 1);
    request.onupgradeneeded = () => request.result.createObjectStore("probe");
    request.onerror = () => { clearTimeout(timer); reject(request.error); };
    request.onblocked = () => { clearTimeout(timer); reject(Error("IDB blocked")); };
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("probe", "readwrite");
      const store = transaction.objectStore("probe");
      store.put(key, "key");
      let readBack = false;
      const read = store.get("key");
      read.onsuccess = () => { readBack = read.result === key; };
      transaction.oncomplete = () => { clearTimeout(timer); db.close(); window.indexedDB.deleteDatabase(key); if (readBack) resolve(); else reject(Error("IDB read mismatch")); };
      transaction.onerror = () => { clearTimeout(timer); db.close(); window.indexedDB.deleteDatabase(key); reject(transaction.error); };
    };
  }));
  let storage: { usage?: number; quota?: number; persisted?: boolean } | null = null;
  await attempt(async () => { storage = { ...await navigator.storage.estimate(), persisted: await navigator.storage.persisted() }; });
  const ua = navigator.userAgent;
  return {
    capturedAt: new Date().toISOString(), secureContext: window.isSecureContext,
    webgpu: !!nav.gpu, adapter, device, features, limits, gpuInfo, indexedDB, cacheStorage, localStorage,
    approximateDeviceMemoryGiB: nav.deviceMemory ?? null, gpuMemoryBytes: null,
    hardwareConcurrency: nav.hardwareConcurrency, storage,
    userAgent: ua, platform: nav.platform,
    browser: /SamsungBrowser/i.test(ua) ? "Samsung Internet" : /CriOS/i.test(ua) ? "Chrome iOS" : /Chrome/i.test(ua) ? "Chrome" : /Safari/i.test(ua) ? "Safari" : "Unknown",
    os: /iPhone|iPad/i.test(ua) ? "iOS/iPadOS" : /Android/i.test(ua) ? "Android" : "Other",
    online: navigator.onLine,
  };
}
