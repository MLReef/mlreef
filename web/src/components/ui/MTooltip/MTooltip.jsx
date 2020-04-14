import React from 'react';
import PropTypes from 'prop-types';
import './MTooltip.scss';

const MTooltip = (props) => {
  const {
    simple,
    message,
    scale,
    className,
    position,
  } = props;

  return (
    <span className={`m-tooltip ${className}`} title={simple ? message : null}>
      <i
        className="m-tooltip-icon fa fa-question-circle t-dark"
        style={{ fontSize: `${scale}%` }}
      />
      {!simple && (
        <div className={`m-tooltip-text ${position} border-rounded`}>
          {message}
        </div>
      )}
    </span>
  );
};
MTooltip.defaultProps = {
  simple: false,
  scale: 100,
  className: '',
  position: 'up',
};

MTooltip.propTypes = {
  simple: PropTypes.bool,
  message: PropTypes.string.isRequired,
  scale: PropTypes.number,
  className: PropTypes.string,
  position: PropTypes.string,
};

export default MTooltip;
