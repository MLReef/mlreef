import store from '../store';

/**
 * Returns the gitlab token. (legacy)
 */
export const getCurrentToken = () => {
  const { user } = store.getState();

  return user && `Bearer ${user.token}`;
};

export const filterBots = (users) => {
  const bot = /bot$/;
  return users
    .filter((user) => !bot.test(user.username) && !bot.test(user.user_name));
};

// return a remote defined route, or the current host.
export const getRootUrl = () => {
  const rootUrl = process.env.REACT_APP_BACKEND_REROUTE_URL;
  const protocol = window?.location?.protocol;
  const hostname = window?.location?.hostname;

  return rootUrl || `${protocol}//${hostname}`;
};

export const filterRoot = (users) => users.filter((user) => user.id !== 1);
