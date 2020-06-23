// prototype.
// this is modified only for MSimpleTabsRouted

import React, { useState, useEffect } from 'react';
import * as PropTypes from 'prop-types';
import cx from 'classnames';
import './MSimpleTabs.scss';

const MSimpleTabs = (props) => {
  const {
    id,
    sections,
    border,
    vertical,
    pills,
    menuStyle,
    tabStyle,
    contentStyle,
    sectionStyle,
    menuClassNames,
    contentClassNames,
    className,
    onSelect,
    selectionOverride,
  } = props;

  const defaultSection = sections.find(({ defaultActive }) => defaultActive);
  const initialSection = defaultSection || sections[0];
  const [sectionDisplayed, setSectionDisplayed] = useState(initialSection.label);

  const checkActive = (label) => label === sectionDisplayed;

  const handleClickLabel = (label) => () => {
    onSelect(label);
    setSectionDisplayed(label);
  };

  useEffect(
    () => {
      if (selectionOverride) setSectionDisplayed(selectionOverride);
    },
    [selectionOverride],
  );

  return (
    <div className={`simple-tabs ${className}`}>
      <div className={cx({ 'simple-tabs-container': true, border, vertical })}>
        <ul
          style={menuStyle}
          className={cx(['simple-tabs-menu', menuClassNames, { vertical }])}
        >
          {sections.map(({ label }) => (
            <li
              key={`simple-tab-menu-${id}-${label}`}
              style={tabStyle}
              className={cx({ 'simple-tabs-menu-tab': true, border, pills })}
            >
              <button
                type="button"
                onClick={handleClickLabel(label)}
                className={cx({
                  'simple-tabs-menu-tab-btn': true,
                  active: checkActive(label),
                  border,
                })}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
        <section style={contentStyle} className={`simple-tabs-content ${contentClassNames}`}>
          {sections.map(({ label, content }) => (
            <div
              key={`simple-tabs-content-${id}-${label}`}
              id="user"
              style={sectionStyle}
              className={cx({
                'simple-tabs-content-section': true,
                active: checkActive(label),
              })}
            >
              {content}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

MSimpleTabs.defaultProps = {
  id: 'unique',
  vertical: false,
  pills: false,
  border: false,
  tabStyle: {},
  menuStyle: {},
  contentStyle: {},
  sectionStyle: {},
  menuClassNames: '',
  contentClassNames: '',
  className: '',
  onSelect: () => {},
  selectionOverride: '',
};

MSimpleTabs.propTypes = {
  sections: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    content: PropTypes.node.isRequired,
    defaultActive: PropTypes.bool,
  })).isRequired,

  id: PropTypes.string,
  vertical: PropTypes.bool,
  pills: PropTypes.bool,
  border: PropTypes.bool,
  tabStyle: PropTypes.shape({}),
  menuStyle: PropTypes.shape({}),
  contentStyle: PropTypes.shape({}),
  sectionStyle: PropTypes.shape({}),
  menuClassNames: PropTypes.string,
  contentClassNames: PropTypes.string,
  className: PropTypes.string,
  onSelect: PropTypes.func,
  selectionOverride: PropTypes.string,
};

export default MSimpleTabs;
