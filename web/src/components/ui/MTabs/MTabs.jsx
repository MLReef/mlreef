import React, { useRef } from 'react';
import * as PropTypes from 'prop-types';
import './MTabs.scss';
import MTabsSection from './MTabsSection';

const MTabs = (props) => {
  const {
    children: sections,
    vertical,
  } = props;

  const contentsRef = useRef(null);
  const tabsRef = useRef(null);

  const showSection = (id, callback, color) => () => {
    const contents = contentsRef.current;
    const tabs = tabsRef.current;
    const tabId = `tab-${id}`;
    Array.from(contents.children).forEach((content) => {
      if (content.id === id) content.classList.add('active');
      else content.classList.remove('active');
    });

    Array.from(tabs.children).forEach((tab) => {
      if (tab.id === tabId) {
        tab.classList.add('active');
        tab.style.borderBottom = `4px solid ${color}`;
      } else {
        tab.classList.remove('active');
        tab.style = '';
      }
    });


    return callback && callback();
  };

  let finalSections = sections;

  if (!finalSections) {
    return <></>;
  }

  if (!Array.isArray(finalSections)) {
    finalSections = [sections];
  }

  const tabs = finalSections.map((el) => {
    const {
      id,
      label,
      defaultActive,
      callback,
      color,
    } = el.props;
    return {
      id,
      label,
      defaultActive,
      callback,
      color,
    };
  });
  return (
    <div className={`m-tabs ${vertical ? 'vertical' : ''}`}>
      <div className="m-tabs_menu">
        <ul className="m-tabs_menu_container" ref={tabsRef}>
          {tabs.map((tab) => (
            <li
              className={`m-tabs_menu_tab ${tab.defaultActive ? 'active' : ''}`}
              style={{ borderBottom: tab.defaultActive ? `4px solid ${tab.color}` : '' }}
              id={`tab-${tab.id}`}
              key={tab.label}
              href={`#${tab.id}`}
            >
              <button
                className="m-tabs_menu_tab_btn neutral"
                type="button"
                onClick={showSection(tab.id, tab.callback, tab.color)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="m-tabs_content" ref={contentsRef}>
        {sections}
      </div>
    </div>
  );
};

MTabs.defaultProps = {
  vertical: false,
  children: undefined,
};

MTabs.propTypes = {
  vertical: PropTypes.bool,
  children: PropTypes.arrayOf(PropTypes.shape({
    sections: PropTypes.any,
  })),
};

MTabs.Section = MTabsSection;

export default MTabs;
