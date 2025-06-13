export function containsSubPath(urlString: string, subPath?: string) {
  const splitUrl = urlString.split('/')
    .filter(u => !!u);

  return !!subPath && splitUrl.includes(subPath);
}
