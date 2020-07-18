import React from 'react';
import * as PropTypes from 'prop-types';


const MTabsSection = (props) => {
  const {
    label,
    id,
    defaultActive,
    children,
    color,
    className,
    wide,
  } = props;

  return (
    <div
      label={label}
      id={id}
      color={color}
      style={{ maxWidth: wide ? '950px' : undefined }}
      className={`m-tabs_content_section ${defaultActive ? 'active' : ''}`}
    >
      <div className={`m-tabs_content_section_container ${className}`}>
        {children}
      </div>
    </div>
  );
};

MTabsSection.defaultProps = {
  defaultActive: false,
  wide: false,
  color: 'transparent',
  className: '',
};

MTabsSection.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  defaultActive: PropTypes.bool,
  wide: PropTypes.bool,
  color: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  className: PropTypes.string,
};

export default MTabsSection;
