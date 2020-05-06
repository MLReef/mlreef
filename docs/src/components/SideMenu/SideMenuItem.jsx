import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'gatsby';
import { useLocation } from '@reach/router';
import cx from 'classnames';
import { sanatizeURL as s } from '../../utils';

const SideMenuItem = props => {
  const {
    level,
    withBar,                          // force to render the little bar
    onItemActivated,                  // function if a children is active
    content: { label, href, items }
  } = props;

  // control whether menu expand or not
  const [collapsed, setCollapsed] = useState(true);
  // to show the little bar only in level 1
  const [bar, setBar] = useState(false);

  const { pathname } = useLocation();

  // if the item is the current page
  const active = useMemo(
    () => {
      const re = new RegExp('^\\/?' + s(href) + '\\/?$');
      return re.test(pathname);
    },
    [pathname, href]
  );

  // if is active (current page) inform the parent
  useEffect(() => { active && onItemActivated() }, [active, onItemActivated]);

  // if some children is active open the menu and render little bar
  const handleItemActivated = () => {
    setCollapsed(false);
    setBar(true);
    onItemActivated();
  }

  // to fix internal routes
  const fixUrl= href => /^\/.*/.test(href) ? href : `/${href}`;

  // when arrow button is clicked
  const toggleCollapsed = () => setCollapsed(!collapsed);

  return (
    <div className={cx({
        'side-menu-item': true,
        'bar': level === 1 && (withBar || bar),
        'active': active
      })}
    >
      <span
        className="side-menu-item-label"
        style={{
          paddingLeft: `${level}rem`,
          fontWeight: `${items ? 'bold' : 'normal'}`
        }}
      >
        {href ? (
          <Link className="nav-link flex-1" to={fixUrl(href)}>
            {label}
          </Link>
        ) : (
          <span className="flex-1">{label}</span>
        )}
        {items && (
          <button
            type="button"
            onClick={toggleCollapsed}
            className="btn btn-hidden mx-2"
          >
            <i className={`fa fa-chevron-${collapsed ? 'down' : 'up'}`} />
          </button>
        )}
      </span>
      {items && (
        <div className={`side-menu-item-content ${collapsed ? 'collapsed' : ''}`}>
          { (items).map((item, index) => (
            <SideMenuItem
              key={`side-menu-${item.label}-${index}`}
              content={item}
              level={level + 1}
              onItemActivated={handleItemActivated}
            />
          )) }
        </div>
      )}
    </div>
  );
};

SideMenuItem.defaultProps = {
  level: 1,
  onItemActivated: () => {},
};

export default SideMenuItem;
