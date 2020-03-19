import React from 'react';
import PropTypes from 'prop-types';

const MCardHeader = (props) => {
  const {
    className,
    children,
    title,
  } = props;

  return (
    <div className={`${className} m-card-header border-rounded-top`}>
      <div className="m-card-header-title">
        <b>{title}</b>
      </div>
      <div className="m-card-header-buttons h-min-btn-sm">
        {children}
      </div>
    </div>
  );
};

MCardHeader.defaultProps = {
  className: '',
  title: 'Card title',
};

MCardHeader.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default MCardHeader;
