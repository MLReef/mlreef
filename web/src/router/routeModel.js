import * as PropTypes from 'prop-types';

export class Route {}

export const RecordedPropTypes = PropTypes.shape({
  name: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  component: PropTypes.elementType.isRequired,
  exact: PropTypes.bool,
  meta: PropTypes.shape({
    requiresAuth: PropTypes.bool,
  }),
});

export const RoutePropTypes = PropTypes.shape({
  name: PropTypes.string.isRequired,
  path: PropTypes.string,
  params: PropTypes.shape({}),
  query: PropTypes.shape({}),
});
