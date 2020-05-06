export const sanatizeURL = url => {
  const prefix = process.env.GATSBY_PATH_PREFIX;

  return prefix ? `${prefix}/${url}` : url;
};

export const sort = items => [...items].sort((a, b) => {
  if (a.href > b.href) return -1;
  if (a.href < b.href) return 1;
  return 0;
});
