import type { AddProtocolAction } from "maplibre-gl";

type ProtocolResponse = Awaited<ReturnType<AddProtocolAction>>;
type Reader = (
  params: Parameters<AddProtocolAction>[0],
  controller: AbortController,
) => Promise<Omit<ProtocolResponse, "data"> & { data: ProtocolResponse["data"] | null }>;

function aborted() {
  const error = new Error("The tile request was aborted.");
  error.name = "AbortError";
  return error;
}

/** Keep shared reads alive while obsolete tiles are quietly discarded by MapLibre. */
export function windProtocolHandler(read: Reader): AddProtocolAction {
  return async (params, controller) => {
    if (controller.signal.aborted) throw aborted();
    const sharedRead = new AbortController();
    try {
      const response = await read(params, sharedRead);
      if (controller.signal.aborted || response.data === null) throw aborted();
      return { ...response, data: response.data };
    } catch (error) {
      if (controller.signal.aborted || error instanceof Error && error.name === "AbortError") throw aborted();
      throw error;
    }
  };
}
