import React from 'react';
import PropTypes from 'prop-types';

const MCardSection = (props) => {
  const {
    children,
  } = props;

  return (
    <div className="m-card-content-section">
      {children}
    </div>
  );
};

MCardSection.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default MCardSection;
