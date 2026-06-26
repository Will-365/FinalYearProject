/** Ensure Atlas URIs include a database name (defaults to greencare). */
export function normalizeMongoUri(uri) {
  if (!uri) return uri;
  const db = process.env.MONGODB_DB || 'greencare';

  if (uri.includes('mongodb.net/?')) {
    return uri.replace('mongodb.net/?', `mongodb.net/${db}?`);
  }
  if (/mongodb\.net\/?$/.test(uri)) {
    return uri.replace(/mongodb\.net\/?$/, `mongodb.net/${db}`);
  }
  if (uri.includes('mongodb.net') && !uri.match(/mongodb\.net\/[^/?]+/)) {
    return uri.replace(/mongodb\.net\/?/, `mongodb.net/${db}/`);
  }
  return uri;
}
