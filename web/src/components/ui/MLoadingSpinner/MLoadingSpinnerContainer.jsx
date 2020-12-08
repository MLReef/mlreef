import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import MLoadingSpinner from './MLoadingSpinner';

const MLoadingSpinnerContainer = (props) => {
  const {
    className,
    active,
    children,
  } = props;

  return !active ? children : (
    <div className={cx('m-loading-spinner-container', className)}>
      <MLoadingSpinner />
    </div>
  );
};

MLoadingSpinnerContainer.defaultProps = {
  className: '',
  active: false,
};

MLoadingSpinnerContainer.propTypes = {
  className: PropTypes.string,
  active: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
  ]).isRequired,
};

export default MLoadingSpinnerContainer;
