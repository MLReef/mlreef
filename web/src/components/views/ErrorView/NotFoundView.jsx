import React from 'react';
import PropTypes from 'prop-types';
import './NotFoundView.scss';

const NotFoundView = (props) => {
  const {
    errorCode,
    errorMessage,
  } = props;

  return (
    <div className="not-found-view">
      <div className="not-found-view-container">
        <div className="not-found-view-title">
          <h1 className="title">{errorCode}</h1>
        </div>
        <div className="not-found-view-content">
          <h2>
            {errorMessage}
          </h2>
          <div className="">
            There are only shadows here, return home!
          </div>
        </div>
        <div className="not-found-view-actions">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="btn btn-basic-primary mx-2"
          >
            Back
          </button>
          <a href="/" className="btn btn-primary mx-2">
            Return home
          </a>
        </div>
      </div>
    </div>
  );
};

NotFoundView.defaultProps = {
  errorCode: 404,
  errorMessage: 'You found an empty space, just for yourself.',
};

NotFoundView.propTypes = {
  errorCode: PropTypes.number,
  errorMessage: PropTypes.string,
};

export default NotFoundView;
