/** Public coverage; an explicit false remains an operational kill switch. */
export function lakePageEnabled(env: { NODE_ENV?: string; ALPLAKES_LAKE_PAGE_ENABLED?: string } = process.env) {
  return env.ALPLAKES_LAKE_PAGE_ENABLED !== "false";
}
