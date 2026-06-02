export async function fetchApi(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const res = await fetch(url, options);
  if (res.status === 401) {
    globalThis.dispatchEvent(new CustomEvent("session-expired"));
  }
  return res;
}
