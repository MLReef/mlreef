import React from 'react';
import PropTypes from 'prop-types';
import MCheckBox from 'components/ui/MCheckBox/MCheckBox';
import './MDataFilters.scss';

const MDataFilters = (props) => {
  const { filters, className } = props;

  const handleClick = (e) => {
    e.target.closest('.item').classList.toggle('closed');
  };

  return (
    <div className={`m-data-filters px-3 ${className}`}>
      <div className="m-data-filters-actions">
        <p className="mr-3">Refine by</p>
        <button type="button" className="btn btn-hidden t-info">
          Clear filters
        </button>
      </div>
      <div className="m-data-filters-list">
        {filters.map((filter) => (
          <div key={`${filter.name}`} className="m-data-filters-list-item item">
            <button
              type="button"
              className="m-data-filters-list-item-btn"
              onClick={handleClick}
            >
              <span className="m-data-filters-list-item-btn-label">
                {filter.name}
              </span>
              <i className="fa fa-chevron-down" />
            </button>
            <div className="m-data-filters-list-item-options">
              {filter.options.map((type) => (
                <MCheckBox
                  small
                  key={`${type.name}-${type.name}-comp`}
                  name={type.name}
                  labelValue={type.name}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

MDataFilters.defaultProps = {
  className: '',
};

MDataFilters.propTypes = {
  filters: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    selected: PropTypes.number,
    options: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })),
  })).isRequired,
  className: PropTypes.string,
};

export default MDataFilters;
