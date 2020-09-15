import React from 'react';
import ErrorPage from './errorPage';

const Error404Page = () => (
  <ErrorPage
    errorCode="404"
    errorMessage="Route not found"
  />
);

export default Error404Page;
