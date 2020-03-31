import React from 'react';
import * as PropTypes from 'prop-types';


const MTabsSection = (props) => {
  const {
    label,
    id,
    defaultActive,
    children,
    color,
  } = props;

  return (
    <div
      label={label}
      id={id}
      color={color}
      className={`m-tabs_content_section ${defaultActive ? 'active' : ''}`}
    >
      <div className="m-tabs_content_section_container">
        {children}
      </div>
    </div>
  );
};

MTabsSection.defaultProps = {
  defaultActive: false,
  color: 'transparent',
};

MTabsSection.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  defaultActive: PropTypes.bool,
  color: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default MTabsSection;
