export const LOCAL_MODEL = {
  id: "onnx-community/gemma-3-1b-it-ONNX",
  revision: "a58439f40017d3b99c7d378ff525e54e0ba08ebf",
  dtype: "q4",
  runtime: "4.3.0",
  experimentPrompt: "compact-contract-v2",
  // Published file metadata, not measured download or peak RAM.
  publishedWeightBytes: 859454179,
  publishedTokenizerBytes: 20325340,
} as const;

export const LAB_CACHE = "lastly-local-parser-assets-v1";
export const LAB_RUN_KEY = "lastly-local-parser-pending-v1";
export const LOAD_TIMEOUT_MS = 300_000;
export const PARSE_TIMEOUT_MS = 120_000;
