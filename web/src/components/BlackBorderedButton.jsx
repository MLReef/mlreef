import React from 'react';
import { func, string } from 'prop-types';

const BlackBorderedButton = ({ id, textContent, onClickHandler, className }) => {
  return (
    <button
      id={id}
      onClick={onClickHandler}
      className={`${className} btn btn-basic-dark t-uppercase`}
    >
      {textContent}
    </button>
  );
};

BlackBorderedButton.propTypes = {
  id: string.isRequired,
  textContent: string.isRequired,
  onClickHandler: func.isRequired,
};

export default BlackBorderedButton;
