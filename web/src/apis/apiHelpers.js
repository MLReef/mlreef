import store from '../store';

export const getCurrentToken = () => {
  const { user } = store.getState();

  return user && user.token;
};

export const generateGetRequest = (url) => fetch(new Request(
  url, {
    method: 'GET',
    headers: new Headers({
      'PRIVATE-TOKEN': getCurrentToken(),
    }),
  },
));
