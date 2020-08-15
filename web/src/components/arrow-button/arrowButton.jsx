import React, { useRef } from 'react';
import $ from 'jquery';
import PropTypes from 'prop-types';
import './arrowButton.scss';

const ArrowButton = ({
  placeholder,
  callback,
  params,
  id,
  isOpened,
  buttonStyle
}) => {
  const ref = useRef();

  function rotate() {
    if (ref.current) {
      $(ref.current).attr('tabindex', 1).focus();
      $(ref.current).toggleClass('active');
      $(ref.current).find('.dropdown-menu').slideToggle(300);

      if (ref.current.classList.contains('background-rotate')) {
        $(ref.current).removeClass('background-rotate');
      } else {
        $(ref.current).addClass('background-rotate');
      }
    }
  }
  function handleDropDownClick(e) {
    rotate();

    if (callback && typeof callback === 'function') {
      callback(e, params);
    }
  }

  return (
    <div className="dropdown-btn-container-div">
      <button
        aria-label="dropdown-btn"
        style={buttonStyle}
        type="button"
        id={id}
        key={id}
        ref={ref}
        className={`btn btn-icon btn-hidden fa fa-chevron-down p-1 ${isOpened ? 'background-rotate' : ''}`}
        onClick={(e) => { handleDropDownClick(e); }}
      />
      { placeholder && (
      <p>{placeholder}</p>
      )}
    </div>
  );
};

ArrowButton.propTypes = {
  placeholder: PropTypes.string,
  callback: PropTypes.func,
  params: PropTypes.shape({}),
  id: PropTypes.string,
  isOpened: PropTypes.bool,
  buttonStyle: PropTypes.shape({}),
};

ArrowButton.defaultProps = {
  placeholder: '',
  callback: () => {},
  params: {},
  id: '',
  isOpened: false,
  buttonStyle: {},
};

export default ArrowButton;
