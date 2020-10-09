import React from 'react';
import PropTypes from 'prop-types';

const MCardSection = (props) => {
  const {
    children,
    cardContentStyle,
  } = props;

  return (
    <div style={{ border: `2px solid ${cardContentStyle}` }} className="m-card-content-section">
      {children}
    </div>
  );
};

MCardSection.defaultProps = {
  cardContentStyle: 'var(--light)',
};

MCardSection.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  cardContentStyle: PropTypes.string,
};

export default MCardSection;
