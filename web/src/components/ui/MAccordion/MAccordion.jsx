import React from 'react';
import * as PropTypes from 'prop-types';
import './MAccordion.scss';
import MAccordionItem from './MAccordionItem';

const MAccordion = (props) => {
  const { children } = props;

  return (
    <div className="m-accordion">
      <div className="m-accordion_container">
        {children}
      </div>
    </div>
  );
};

MAccordion.Item = MAccordionItem;

MAccordion.propTypes = {
  children: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default MAccordion;
