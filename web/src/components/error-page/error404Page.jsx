import React from 'react';
import PropTypes from 'prop-types';
import ErrorPage from './errorPage';

const Error404Page = (props) => {
  const {
    match: {
      params: { info },
    },
  } = props;

  return (
    <ErrorPage
      errorCode="404"
      errorMessage={(
        <span>
          {'Route '}
          {info && (
            <span style={{ fontWeight: 'bold' }}>
              {`${decodeURIComponent(info)} `}
            </span>
          )}
          not found
        </span>
      )}
    />
  );
};

Error404Page.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      info: PropTypes.string,
    }),
  }).isRequired,
};

export default Error404Page;
