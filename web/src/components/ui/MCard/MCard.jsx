import React from 'react';
import PropTypes from 'prop-types';
import './MCard.scss';
import MCardHeader from './MCardHeader';
import MCardSection from './MCardSection';

const MCard = (props) => {
  const {
    title,
    buttons,
    children,
    className,
  } = props;

  return (
    <div className={`${className} m-card border-rounded`}>
      <MCardHeader title={title}>
        {buttons}
      </MCardHeader>
      <div className="m-card-content">
        {children}
      </div>
    </div>
  );
};

MCard.defaultProps = {
  title: '',
  buttons: [],
  className: '',
};

MCard.propTypes = {
  title: PropTypes.string,
  buttons: PropTypes.arrayOf(PropTypes.node),
  className: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

MCard.Section = MCardSection;

export default MCard;
