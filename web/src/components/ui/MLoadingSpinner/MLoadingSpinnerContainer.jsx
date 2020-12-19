import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import MLoadingSpinner from './MLoadingSpinner';

const MLoadingSpinnerContainer = (props) => {
  const {
    className,
    active,
    children,
    cover,
  } = props;

  return !active ? children : (
    <div className={cx('m-loading-spinner-container', className, { cover })}>
      <MLoadingSpinner className={cx({ cover })} />
      {cover && children}
    </div>
  );
};

MLoadingSpinnerContainer.defaultProps = {
  className: '',
  active: false,
  cover: false,
};

MLoadingSpinnerContainer.propTypes = {
  className: PropTypes.string,
  active: PropTypes.bool,
  cover: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
  ]).isRequired,
};

export default MLoadingSpinnerContainer;
