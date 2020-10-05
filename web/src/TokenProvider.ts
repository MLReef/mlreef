import store from './store';

export const getCurrentToken = () : string => {
  const { user } = store?.getState();

  return user && `Bearer ${user.access_token}`;
}

export const getAuth = (): boolean => {
  const { user } = store?.getState();

  return !!user?.auth;
}
