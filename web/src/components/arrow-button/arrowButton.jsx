import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './arrowButton.scss';

const ArrowButton = ({
  placeholder,
  callback,
  id,
  buttonStyle,
  initialIsOpened,
}) => {
  const [isOpened, setIsOpened] = useState(initialIsOpened);
  const buttonRef = useRef();
  useEffect(() => {
    setIsOpened(initialIsOpened);
  }, [initialIsOpened]);

  function handleDropDownClick(e) {
    setIsOpened(!isOpened);
    if (callback && typeof callback === 'function') {
      callback(e);
    }
  }

  return (
    <button
      onClick={handleDropDownClick}
      aria-label="dropdown-btn"
      style={buttonStyle}
      type="button"
      id={id}
      ref={buttonRef}
      className="btn btn-icon btn-hidden p-1"
    >
      {placeholder && (
        placeholder
      )}
      <i className={`fa fa-chevron-down ${isOpened ? 'background-rotate' : ''}`} />
    </button>
  );
};

ArrowButton.propTypes = {
  placeholder: PropTypes.string,
  callback: PropTypes.func,
  id: PropTypes.string,
  buttonStyle: PropTypes.shape({}),
};

ArrowButton.defaultProps = {
  placeholder: '',
  callback: () => {},
  id: '',
  buttonStyle: {},
};

export default ArrowButton;
