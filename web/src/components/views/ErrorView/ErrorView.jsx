import React from 'react';
import PropTypes from 'prop-types';
import errorIcon from 'images/error_icon.png';
import './ErrorView.scss';
import NotFoundView from './NotFoundView';

const ErrorView = (props) => {
  const { errorCode, errorMessage } = props;

  return errorCode === 404 ? <NotFoundView /> : (
    <div id="error-page-container">
      <img src={errorIcon} alt="error" />
      <div>
        <h1>
          Error
        </h1>
        <h2>{errorCode}</h2>
        <p>{errorMessage}</p>
      </div>
    </div>
  );
};

ErrorView.defaultProps = {
  errorCode: 500,
  errorMessage: 'Internal server error',
};

ErrorView.propTypes = {
  errorCode: PropTypes.number,
  errorMessage: PropTypes.string,
};

export default ErrorView;
