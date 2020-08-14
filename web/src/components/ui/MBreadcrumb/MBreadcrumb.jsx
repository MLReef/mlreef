import React from 'react';
import * as PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './MBreadcrumb.scss';

const MBreadcrumb = (props) => {
  const {
    items,
    className,
  } = props;

  return (
    <div className={`m-breadcrumb ${className}`}>
      <ul className="m-breadcrumb-list">
        {items.map((item) => (
          <li key={`breadcrumb-${item.name}`} className="m-breadcrumb-list-item">
            {item.href ? (
              <Link to={item.href} className="m-breadcrumb-list-item-link">
                {item.name}
              </Link>
            ) : (
              <span className="m-breadcrumb-list-item-placeholder">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

MBreadcrumb.defaultProps = {
  items: [],
  className: '',
};

MBreadcrumb.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    href: PropTypes.string,
  })),
  className: PropTypes.string,
};

export default MBreadcrumb;
