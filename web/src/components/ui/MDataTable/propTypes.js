import PropTypes from 'prop-types';

export const cols = PropTypes.arrayOf(PropTypes.shape({
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
}));

export const data = PropTypes.arrayOf(PropTypes.shape({
  id: PropTypes.number.isRequired,
  cols,
}));

export const actives = PropTypes.arrayOf(PropTypes.shape({
  color: PropTypes.string,
  cols: PropTypes.arrayOf(PropTypes.number),
}));
