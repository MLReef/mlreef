import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { Route, Link, Switch } from 'react-router-dom';
import cx from 'classnames';
import './TabsRouted.scss';
import './TabsRoutedMarketplace.scss';

// Intermediate component to render tab's content
const InterCo = ({ section, setActive }) => {
  useEffect(
    () => {
      if (document) {
        document.documentElement.style.setProperty('--context', section.color);
      }

      // this hack is to avoid: updating a dismounted component
      const id = setTimeout(() => { setActive(section); });

      return () => clearTimeout(id);
    },
    [section, setActive],
  );

  return section.content;
};

const TabsRouted = (props) => {
  const {
    className,
    sections,
    original,
    pills,
    baseURL,
  } = props;

  const makeRoute = useCallback(
    (section) => `${baseURL}/${(section.slug || section.label)}`,
    [baseURL],
  );

  const initialSection = useMemo(
    () => {
      const defaultSection = sections.find((section) => section.defaultActive);

      return defaultSection || sections[0] || {};
    },
    [sections],
  );

  const [active, setActive] = useState({});

  const compareSection = useCallback(
    (section) => {
      const secSlug = section.slug || section.label;
      const actSlug = active.slug || active.label;

      return secSlug === actSlug;
    },
    [active],
  );

  return (
    <div className={cx('tabs-routed', className, { original, pills })}>
      <div className="tabs-routed-container">
        <ul className="tabs-routed-menu">
          {sections.map((section) => (
            <li key={`tab-${makeRoute(section)}`} className={cx('tabs-routed-menu-tab', { pills })}>
              <Link
                to={makeRoute(section)}
                onClick={section.callback}
                className={cx('tabs-routed-menu-tab-btn', { active: compareSection(section) })}
              >
                {section.label}
              </Link>
            </li>
          ))}
        </ul>
        <section className="tabs-routed-content">
          <Switch>
            {sections.map((section) => (
              <Route key={`section-${makeRoute(section)}`} path={makeRoute(section)}>
                <InterCo section={section} setActive={setActive} />
              </Route>
            ))}
            <Route>
              <InterCo section={initialSection} setActive={setActive} />
            </Route>
          </Switch>
        </section>
      </div>
    </div>
  );
};

TabsRouted.defaultProps = {
  className: '',
  original: false,
  pills: false,
  baseURL: '/',
};

TabsRouted.propTypes = {
  className: PropTypes.string,
  original: PropTypes.bool,
  pills: PropTypes.bool,
  baseURL: PropTypes.string,
  sections: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    slug: PropTypes.string,
    content: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.node,
    ]).isRequired,
    color: PropTypes.string,
  })).isRequired,
};

export default TabsRouted;
