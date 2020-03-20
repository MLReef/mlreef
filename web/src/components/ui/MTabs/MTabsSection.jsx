import React from 'react';
import * as PropTypes from 'prop-types';


const MTabsSection = (props) => {
  const {
    label,
    id,
    defaultActive,
    children,
  } = props;

  return (
    <div
      label={label}
      id={id}
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
};

MTabsSection.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  defaultActive: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default MTabsSection;
