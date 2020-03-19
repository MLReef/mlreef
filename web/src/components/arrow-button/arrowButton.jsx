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
        className="btn btn-icon btn-hidden fa fa-chevron-down p-1"
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
  params: PropTypes.object,
  id: PropTypes.string,
};

ArrowButton.defaultProps = {
  placeholder: '',
  callback: () => {},
  params: {},
  id: '',
};

export default ArrowButton;
