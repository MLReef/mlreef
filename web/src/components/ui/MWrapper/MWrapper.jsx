import React from 'react';
import * as PropTypes from 'prop-types';
import './MWrapper.scss';

const MWrapper = (props) => {
  const {
    disable,
    norender,
    title,
    children,
  } = props;

  return (
    <>
      {!norender && (!disable ? children : (
        <div className="m-wrapper" title={title}>
          <div className="m-wrapper-content">
            {children}
          </div>
          <div className="m-wrapper-cover" />
        </div>
      ))}
    </>
  );
};

MWrapper.defaultProps = {
  disable: false,
  norender: false,
  title: '',
};

MWrapper.propTypes = {
  disable: PropTypes.bool,
  norender: PropTypes.bool,
  title: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]).isRequired,
};

export default MWrapper;
