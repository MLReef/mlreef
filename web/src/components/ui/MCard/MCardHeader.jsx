import React from 'react';
import PropTypes from 'prop-types';

const MCardHeader = (props) => {
  const {
    className,
    children,
    title,
    headerColor,
  } = props;

  return (
    <div style={{ backgroundColor: `${headerColor}` }} className={`${className} m-card-header border-rounded-top`}>
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
  headerColor: 'var(--dark)',
  title: 'Card title',
};

MCardHeader.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  headerColor: PropTypes.string,
};

export default MCardHeader;
