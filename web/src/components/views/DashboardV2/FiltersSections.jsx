import React, { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import MCheckBoxGroup from 'components/ui/MCheckBoxGroup';
import MRadioGroup from 'components/ui/MRadio/MRadioGroup';
import { toCamelCase } from 'functions/helpers';
import './FiltersSection.scss';
import { DashboardContext } from './DashboardContext';
import { dataTypes, publishedStateOptions, sortingOPtions } from './constants';

const FiltersSection = () => {
  const [{
    selectedDataTypes,
    sorting,
    publishState,
    minimumStars,
  }, dispatch] = useContext(DashboardContext);

  const { classification2 } = useParams();
  const [filtersVisible, setFiltersVisibility] = useState(false);

  return (
    <div className="dashboard-v2-content-filters">
      <button
        className="toggle-hide-show"
        type="button"
        onClick={() => setFiltersVisibility(!filtersVisible)}
      >
        <i className="fas fa-sliders-h" />
        {filtersVisible ? ' Hide ' : ' See '}
        filters
      </button>
      {filtersVisible && (
        <div className="dashboard-v2-content-filters-content">
          <div className="dashboard-v2-content-filters-content-dt">
            <p className="dashboard-v2-content-filters-content-dt-heading">Filter by input data type</p>
            <div className="dashboard-v2-content-filters-content-dt-list">
              <MCheckBoxGroup
                options={dataTypes
                  .map((dtype, ind) => ({ label: toCamelCase(dtype.label), value: ind }))}
                onSelect={(...[value]) => dispatch({ type: 'SET_SELECTED_DATA_TYPE', payload: value })}
                values={selectedDataTypes}
              />
            </div>
          </div>
          <div className="dashboard-v2-content-filters-content-metrics">
            <p className="dashboard-v2-content-filters-content-metrics-heading">Project Metrics</p>
            <input
              placeholder="Minimum of stars"
              value={minimumStars}
              onChange={({ target: { value } }) => dispatch({ type: 'SET_MINIMUM_STARS', payload: value })}
            />
          </div>
          <div className="dashboard-v2-content-filters-content-sorts">
            <p className="dashboard-v2-content-filters-content-sorts-heading">Sort by</p>
            <MRadioGroup
              name="sorting-options"
              onChange={(val) => dispatch({ type: 'SET_SORTING', payload: val })}
              value={sorting}
              options={sortingOPtions}
            />
          </div>
          {(classification2 && classification2 !== 'data_project') && (
            <div className="dashboard-v2-content-filters-content-publish-state">
              <p className="dashboard-v2-content-filters-content-publish-state-heading">Published state</p>
              <MRadioGroup
                onChange={(val) => dispatch({ type: 'SET_PUBLISH_STATE', payload: val })}
                value={publishState}
                options={publishedStateOptions}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FiltersSection;
