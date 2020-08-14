import React, { useState, useEffect } from 'react';
import * as PropTypes from 'prop-types';
import useHashNavigation from 'customHooks/useHashNavigation';
import useGlobalMarker from 'customHooks/useGlobalMarker';
import cx from 'classnames';
import './MSimpleTabs.scss';
import { convertToSlug as _s } from 'functions/dataParserHelpers';

// const _s = (e) => e;

const MSimpleTabs = (props) => {
  const {
    id,
    sections,
    border,
    vertical,
    original,
    pills,
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
  const [sectionDisplayed, setSectionDisplayed] = useState(_s(initialSection.label));
  const setSectionHasRouted = useHashNavigation(setSectionDisplayed);
  const [{ color }, { setColor }] = useGlobalMarker();

  useEffect(
    () => {
      const actSection = sections.find((sec) => _s(sec.label) === sectionDisplayed);
      if (actSection) setColor(actSection.color);
    },
    [sectionDisplayed, sections, setColor],
  );

  const checkActive = (label) => _s(label) === sectionDisplayed;

  return (
    <div className={cx(['simple-tabs', className], { original })}>
      <div className={cx({ 'simple-tabs-container': true, border, vertical })}>
        <ul
          style={menuStyle}
          className={cx(['simple-tabs-menu', menuClassNames, { vertical }])}
        >
          {sections.map(({ label, disabled }) => (
            <li
              key={`simple-tab-menu-${id}-${label}`}
              style={tabStyle}
              className={cx({
                'simple-tabs-menu-tab': true,
                border,
                pills,
              })}
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() => setSectionHasRouted(_s(label))}
                style={{ borderColor: checkActive(label) && color }}
                className={cx('simple-tabs-menu-tab-btn border-rounded-top', {
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
  original: false,
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
    content: PropTypes.node.isRequired,
    defaultActive: PropTypes.bool,
  })).isRequired,

  id: PropTypes.string,
  vertical: PropTypes.bool,
  pills: PropTypes.bool,
  border: PropTypes.bool,
  original: PropTypes.bool,
  tabStyle: PropTypes.shape({}),
  menuStyle: PropTypes.shape({}),
  contentStyle: PropTypes.shape({}),
  sectionStyle: PropTypes.shape({}),
  menuClassNames: PropTypes.string,
  contentClassNames: PropTypes.string,
  className: PropTypes.string,
};

export default MSimpleTabs;
