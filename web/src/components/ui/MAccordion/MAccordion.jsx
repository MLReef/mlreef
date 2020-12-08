import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import './MAccordion.scss';
import MAccordionItem from './MAccordionItem';

const MAccordion = (props) => {
  const { children, className } = props;

  return (
    <div className={cx('m-accordion', className)}>
      <div className="m-accordion_container">
        {children}
      </div>
    </div>
  );
};

MAccordion.Item = MAccordionItem;

MAccordion.defaultProps = {
  className: '',
};

MAccordion.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.shape({})),
    PropTypes.node,
  ]).isRequired,
  className: PropTypes.string,
};

export default MAccordion;
