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
      Accept: 'application/json',
    }),
  },
));

export const buildHeaders = () => new Headers({
  'PRIVATE-TOKEN': getCurrentToken(),
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Origin: 'http://localhost',
});
