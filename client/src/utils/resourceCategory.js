const NON_COUNTABLE_PATTERN = /(оборудован|рабоч(?:ее|их|ие|его)\s+мест)/i;

export function isNonCountableResource(resource) {
  const category = typeof resource === 'string' ? resource : resource?.category;
  return NON_COUNTABLE_PATTERN.test(String(category ?? ''));
}
