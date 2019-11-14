import { SECURITY_TOKEN } from '../apiConfig';

// eslint-disable-next-line import/prefer-default-export
export const generateGetRequest = (url) => fetch(new Request(
  url, {
    method: 'GET',
    headers: new Headers({
      'PRIVATE-TOKEN': SECURITY_TOKEN,
    }),
  },
));
