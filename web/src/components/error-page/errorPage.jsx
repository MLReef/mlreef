import React from 'react';
import "./errorPage.css";
import errorIcon from '../../images/error_icon.png';

const ErrorPage = ({ errorCode, errorMessage }) => {
  let finalErrorCode;
  let finalErrorMessage;
  if(!errorCode){
    finalErrorCode = 500;
    finalErrorMessage = "Internal server error";
  } else {
    finalErrorCode = errorCode;
    finalErrorMessage = errorMessage;
  }
  return (
  <div id="error-page-container">
    <img src={errorIcon} alt="error" />
    <div>
      <h1>
        Error
      </h1>
      <h2>{finalErrorCode}</h2>
      <p>{finalErrorMessage}</p>
    </div>
  </div>
)};

export default ErrorPage;
