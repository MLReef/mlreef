import React from 'react';
import { Link } from 'react-router-dom';
import errorIcon from '../../images/error_icon.png';

const ErrorPage = () => (
  <div
    style={{
      marginTop: '2.5%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      fontSize: '2em',
    }}
  >
    <img src={errorIcon} style={{ height: '30%', maxHeight: 600 }} alt="error" />
    <div
      style={{
        backgroundColor: 'beige',
        color: ' #f5544d',
        padding: '1.5em',
        borderRadius: '1em',
      }}
    >
      <h1>
        Error
      </h1>
      <h2>404</h2>
      <p>The site you requested does not exist</p>
      <Link to="/my-projects">Go to the beginning</Link>
    </div>
  </div>
);

export default ErrorPage;
