export const getCurrentToken = () => sessionStorage.getItem('token');

export const generateGetRequest = (url) => fetch(new Request(
  url, {
    method: 'GET',
    headers: new Headers({
      'PRIVATE-TOKEN': getCurrentToken(),
    }),
  },
));
