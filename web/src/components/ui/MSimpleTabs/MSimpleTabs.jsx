import React, { useState } from 'react';
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
    steps,
    menuStyle,
    tabStyle,
    contentStyle,
    sectionStyle,
    menuClassNames,
    contentClassNames,
    className,
  } = props;

  const defaultSection = sections.find(({ defaultActive }) => defaultActive);
  const initialSection = defaultSection || sections[0];
  const [sectionDisplayed, setSectionDisplayed] = useState(initialSection.label);

  const checkActive = (label) => label === sectionDisplayed;

  return (
    <div className={`simple-tabs ${className}`}>
      <div className={cx({ 'simple-tabs-container': true, border, vertical })}>
        <ul
          style={menuStyle}
          className={cx(['simple-tabs-menu', menuClassNames, { vertical, steps, 'steps-simple': steps }])}
        >
          {sections.map(({ label, disabled }, index) => (
            <li
              key={`simple-tab-menu-${id}-${label}`}
              style={tabStyle}
              className={cx({
                'simple-tabs-menu-tab': true,
                'steps-simple': steps,
                border,
                pills,
              })}
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() => setSectionDisplayed(label)}
                className={cx({
                  'simple-tabs-menu-tab-btn': true,
                  active: checkActive(label),
                  'steps-simple': steps,
                  border,
                })}
              >
                {!steps ? (label) : (
                  <span className={cx('label', 'steps-simple', { done: false })}>
                    <div className={cx('label-ordinal', 'steps-simple', { done: false })}>
                      <span className="label-ordinal-number">
                        {index + 1}
                      </span>
                    </div>
                    <div className="mt-2 mr-2 pt-1">
                      {label}
                    </div>
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
        <section style={contentStyle} className={`simple-tabs-content ${contentClassNames}`}>
          {sections.map(({ label, content }) => (
            <div
              key={`simple-tabs-content-${id}-${label}`}
              id={`${id}-${label}`}
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
  steps: false,
  border: false,
  tabStyle: {},
  menuStyle: {},
  contentStyle: {},
  sectionStyle: {},
  menuClassNames: '',
  contentClassNames: '',
  className: '',
};

MSimpleTabs.propTypes = {
  sections: PropTypes.arrayOf(PropTypes.shape({
    disabled: PropTypes.bool,
    label: PropTypes.string.isRequired,
    content: PropTypes.node,
    defaultActive: PropTypes.bool,
  })).isRequired,

  id: PropTypes.string,
  vertical: PropTypes.bool,
  pills: PropTypes.bool,
  steps: PropTypes.bool,
  border: PropTypes.bool,
  tabStyle: PropTypes.shape({}),
  menuStyle: PropTypes.shape({}),
  contentStyle: PropTypes.shape({}),
  sectionStyle: PropTypes.shape({}),
  menuClassNames: PropTypes.string,
  contentClassNames: PropTypes.string,
  className: PropTypes.string,
};

export default MSimpleTabs;
