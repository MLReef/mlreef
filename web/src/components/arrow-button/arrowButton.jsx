import React from 'react';
import $ from 'jquery';
import PropTypes from 'prop-types';
import './arrowButton.css';

const ArrowButton = ({
  placeholder,
  callback,
  params,
  imgPlaceHolder,
  id,
}) => {
  function handleDropDownClick(e) {
    $(e.currentTarget).attr('tabindex', 1).focus();
    $(e.currentTarget).toggleClass('active');
    $(e.currentTarget).find('.dropdown-menu').slideToggle(300);

    if (e.currentTarget.classList.contains('background-rotate')) {
      $(e.currentTarget).removeClass('background-rotate');
    } else {
      $(e.currentTarget).addClass('background-rotate');
    }


    if (callback && typeof callback === 'function') {
      callback(e, params);
    }
  }

  return (
    <div className="dropdown-btn-container-div">
      <button
        aria-label="dropdown-btn"
        type="button"
        id={id}
        key={id}
        className="arrow-button dropdown white-button"
        onClick={(e) => { handleDropDownClick(e); }}
        style={{
          background: `url(${imgPlaceHolder})`,
        }}
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
  params: PropTypes.object,
  imgPlaceHolder: PropTypes.string,
  id: PropTypes.string,
};

ArrowButton.defaultProps = {
  placeholder: '',
  callback: () => {},
  params: {},
  imgPlaceHolder: '',
  id: '',
};

export default ArrowButton;
