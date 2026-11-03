/** Public lake page. An explicit false remains available as a kill switch. */
export function lakePageEnabled(env: { NODE_ENV?: string; ALPLAKES_LAKE_PAGE_ENABLED?: string } = process.env) {
  return env.ALPLAKES_LAKE_PAGE_ENABLED !== "false";
}
