export const sanatizeURL = url => {
  const prefix = process.env.GATSBY_PATH_PREFIX;

  return prefix ? `${prefix}/${url}` : url;
};
