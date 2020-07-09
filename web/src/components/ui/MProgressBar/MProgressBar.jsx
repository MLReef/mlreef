import React from 'react';
import * as PropTypes from 'prop-types';
import './MProgressBar.scss';

const MProgressBar = (props) => {
  const { className, color } = props;

  return (
    <div className={`m-progress-bar ${className}`}>
      <div className="m-progress-bar-container">
        <div className="m-progress-bar-box">
          <div className={`m-progress-bar-box-filled  bg-${color}`} />
        </div>
      </div>
    </div>
  );
};

MProgressBar.defaultProps = {
  className: '',
  color: 'primary',
};

MProgressBar.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string,
};

export default MProgressBar;
