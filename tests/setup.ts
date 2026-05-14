import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "util";

// jsdom lacks TextEncoder/Decoder which `jose` and other libs require.
if (typeof (globalThis as { TextEncoder?: unknown }).TextEncoder === "undefined") {
  (globalThis as { TextEncoder: unknown }).TextEncoder = TextEncoder;
}
if (typeof (globalThis as { TextDecoder?: unknown }).TextDecoder === "undefined") {
  (globalThis as { TextDecoder: unknown }).TextDecoder = TextDecoder;
}
