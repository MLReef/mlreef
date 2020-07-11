import React, { useState } from 'react';
import * as PropTypes from 'prop-types';
import './MAccordionItem.scss';

const MAccordionItem = (props) => {
  const {
    children,
    title,
    subtitle,
    referenceId,
    defaultExpanded,
  } = props;

  const [collapsed, setCollapsed] = useState(!defaultExpanded);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="m-accordion-item">
      <div className="m-accordion-item_header">
        <div className="m-accordion-item_header_label">
          <div className="title">
            {title}
          </div>
          <div className="sub-title">
            {subtitle}
          </div>
        </div>
        <div className="m-accordion-item_header_action">
          <button
            className={`btn btn-outline-dark btn-label-sm btn-sm ${!collapsed ? 'active' : ''}`}
            type="button"
            id={referenceId}
            onClick={toggleCollapse}
          >
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
        </div>
      </div>
      <div className={`m-accordion-item_content ${collapsed ? 'collapsed' : ''}`}>
        {children}
      </div>
    </div>
  );
};

MAccordionItem.defaultProps = {
  subtitle: '',
  defaultExpanded: false,
};

MAccordionItem.propTypes = {
  title: PropTypes.string.isRequired,
  referenceId: PropTypes.string.isRequired,
  subtitle: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]),
  defaultExpanded: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default MAccordionItem;
