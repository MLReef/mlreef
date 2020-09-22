import React, { useMemo, useContext } from 'react';
import * as PropTypes from 'prop-types';
import { Link as ReactLink } from 'react-router-dom';
import { RoutePropTypes } from './routeModel';
import { RouterContext } from './Router';
import { resolveRoute } from './functions';

const Link = (props) => {
  const {
    id,
    children,
    to,
    className,
  } = props;

  const routes = useContext(RouterContext);

  const href = useMemo(
    () => typeof to === 'string'
      ? to
      : resolveRoute(routes, to),
    [routes, to],
  );

  return (
    <ReactLink className={className} to={href} id={id}>
      {children}
    </ReactLink>
  );
};

Link.defaultProps = {
  id: undefined,
  className: '',
  children: undefined,
};

Link.propTypes = {
  className: PropTypes.string,
  id: PropTypes.string,
  to: PropTypes.oneOfType([
    PropTypes.string,
    RoutePropTypes,
  ]).isRequired,
  children: PropTypes.node,
};

export default Link;
