import React from 'react';
import { useSelector } from 'react-redux';
import ErrorView from './components/views/ErrorView';

const ErrorHandler = (props) => {
  const { children } = props;
  const {
    hasErrors,
    info: { code, message },
  } = useSelector(({ errors }) => errors);

  if (hasErrors) {
    return <ErrorView errorCode={code || 500} errorMessage={message || 'Internal error'} />;
  }

  return children;
};

export default ErrorHandler;
