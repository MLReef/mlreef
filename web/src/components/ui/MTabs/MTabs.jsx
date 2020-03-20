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

  const showSection = (id, callback) => () => {
    const contents = contentsRef.current;
    const tabs = tabsRef.current;
    const tabId = `tab-${id}`;

    contents.children.forEach((content) => {
      if (content.id === id) content.classList.add('active');
      else content.classList.remove('active');
    });

    tabs.children.forEach((tab) => {
      if (tab.id === tabId) tab.classList.add('active');
      else tab.classList.remove('active');
    });

    return callback && callback();
  };

  const tabs = sections.map((el) => {
    const {
      id,
      label,
      defaultActive,
      callback,
    } = el.props;

    return {
      id,
      label,
      defaultActive,
      callback,
    };
  });

  return (
    <div className={`m-tabs ${vertical ? 'vertical' : ''}`}>
      <div className="m-tabs_menu">
        <ul className="m-tabs_menu_container" ref={tabsRef}>
          {tabs.map((tab) => (
            <li
              className={`m-tabs_menu_tab ${tab.defaultActive ? 'active' : ''}`}
              id={`tab-${tab.id}`}
              key={tab.label}
              href={`#${tab.id}`}
            >
              <button
                className="m-tabs_menu_tab_btn neutral"
                type="button"
                onClick={showSection(tab.id, tab.callback)}
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
