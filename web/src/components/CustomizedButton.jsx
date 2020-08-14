import React from 'react';
import {
  string, func, bool,
} from 'prop-types';
import { CircularProgress } from '@material-ui/core';

const CustomizedButton = ({
  id,
  onClickHandler,
  buttonLabel,
  loading,
  className,
}) => {
  return (
    <>
      <button
        type="button"
        className={`${className} btn btn-primary`}
        id={id}
        variant="contained"
        disabled={loading}
        onClick={(e) => onClickHandler(e)}
      >
        {buttonLabel}
      </button>
      {loading && <CircularProgress size={30} className="" />}
    </>
  );
};

CustomizedButton.defaultProps = {
  className: '',
};

CustomizedButton.propTypes = {
  id: string.isRequired,
  onClickHandler: func.isRequired,
  buttonLabel: string.isRequired,
  loading: bool.isRequired,
  className: string,
};

export default CustomizedButton;
