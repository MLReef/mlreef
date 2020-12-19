import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import './MLoadingSpinner.scss';

/* This comp can be provisional, it's intended to get rid of mat-ui */

const MLoadingSpinner = (props) => {
  const {
    className,
  } = props;

  return (
    <div className={cx('m-loading-spinner waiting', className)} />
  );
};

MLoadingSpinner.defaultProps = {
  className: '',
};

MLoadingSpinner.propTypes = {
  className: PropTypes.string,
};

export default MLoadingSpinner;
