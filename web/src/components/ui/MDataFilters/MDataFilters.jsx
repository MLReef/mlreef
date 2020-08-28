import React from 'react';
import PropTypes from 'prop-types';
import MDropdown from 'components/ui/MDropdown';
import MCheckBox from 'components/ui/MCheckBox/MCheckBox';
import './MDataFilters.scss';

const MDataFilters = ({ types, className }) => (
  <div className={`m-data-filters px-3 ${className}`}>
    <div className="m-data-filters-actions">
      <p className="mr-3">Refine by</p>
      <button type="button" className="btn btn-hidden t-info">
        Clear filters
      </button>
    </div>

    <div>
      <MDropdown
        label={<span className="mr-5">Data Types</span>}
        buttonClasses="btn btn-hidden"
        component={types.map((type) => (
          <MCheckBox
            key={`${type.name}-${type.label}-comp`}
            name={type.name}
            labelValue={type.label}
          />
        ))}
      />
    </div>
  </div>
);

MDataFilters.defaultProps = {
  className: '',
};

MDataFilters.propTypes = {
  types: PropTypes.arrayOf(PropTypes.shape).isRequired,
  className: PropTypes.string,
};

export default MDataFilters;
