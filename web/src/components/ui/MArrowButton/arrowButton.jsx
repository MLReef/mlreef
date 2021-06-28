import React, { useState, useRef, useEffect } from 'react';
import {
  bool, func, shape, string,
} from 'prop-types';
import './arrowButton.scss';

const ArrowButton = ({
  placeholder,
  callback,
  id,
  buttonStyle,
  className,
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
      className={`btn btn-icon btn-hidden p-1 fa fa-chevron-${isOpened ? 'up' : 'down'} ${className}`}
    >
      {placeholder && (
        placeholder
      )}
    </button>
  );
};

ArrowButton.propTypes = {
  placeholder: string,
  callback: func,
  id: string,
  buttonStyle: shape({}),
  className: string,
  initialIsOpened: bool,
};

ArrowButton.defaultProps = {
  placeholder: '',
  callback: () => {},
  id: '',
  buttonStyle: {},
  className: '',
  initialIsOpened: false,
};

export default ArrowButton;
