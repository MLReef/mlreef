import React, {
  useCallback,
  useContext, useEffect, useState,
} from 'react';
import './ProcessorFilters.scss'
import { toastr } from 'react-redux-toastr';
import { PROJECT_DATA_TYPES } from 'domain/project/ProjectDataTypes';
import { toCamelCase } from 'functions/helpers';
import MTooltip from 'components/ui/MTooltip';
import MCheckBox from 'components/ui/MCheckBox/MCheckBox';
import MCheckBoxGroup from 'components/ui/MCheckBoxGroup';
import { projectClassificationsProps } from 'dataTypes';
import { string } from 'prop-types';
import { DataPipelinesContext } from '../DataPipelineHooks/DataPipelinesProvider';
import { addInformationToProcessors, fetchProcessorsPaginatedByType } from '../DataPipelineHooks/DataPipelinesReducer';
import { UPDATE_CURRENT_PROCESSORS_ARRAY } from '../DataPipelineHooks/actions';

const {
  IMAGE, TEXT, AUDIO, VIDEO, TABULAR, NUMBER, BINARY, MODEL, TIME_SERIES, HIERARCHICAL,
} = PROJECT_DATA_TYPES;

const dtypes = [
  IMAGE,
  TEXT,
  AUDIO,
  VIDEO,
  NUMBER,
  BINARY,
  MODEL,
  TABULAR,
  HIERARCHICAL,
  TIME_SERIES,
];

const buildBody = (ownDataOpsOnly, namespace, starredOpsOnly, numberOfStars, dtypesSelected) => {
  let body = {
    published: true,
  };

  if (ownDataOpsOnly) {
    body = {
      ...body,
      namespace,
    };
  }

  if (starredOpsOnly) {
    body = {
      ...body,
      min_stars: numberOfStars,
    };
  }

  if (dtypesSelected.length > 0) {
    body = {
      ...body,
      input_data_types_or: dtypesSelected,
    };
  }

  return body;
};

const DataOperationFilters = (props) => {
  const { namespace, operationTypeToExecute } = props;
  const [, dispatch] = useContext(DataPipelinesContext);
  const operationClassification = projectClassificationsProps
    .filter((cl) => cl.typeOfProcessor === operationTypeToExecute.toUpperCase())[0]?.classification;
  const [dtypesSelected, setDtypesSelected] = useState([]);
  const [starredOpsOnly, setStarredeOpsOnly] = useState(false);
  const [ownDataOpsOnly, setOwnDataOpsOnly] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [numberOfStars, setNumberOfStars] = useState(1);

  const fetchProcessors = useCallback(() => fetchProcessorsPaginatedByType(
    operationTypeToExecute.toUpperCase(),
    buildBody(
      ownDataOpsOnly,
      namespace,
      starredOpsOnly,
      numberOfStars,
      dtypesSelected.map((ind) => dtypes[ind]),
    ),
  )
    .then(addInformationToProcessors)
    .then((currentProcessors) => dispatch({
      type: UPDATE_CURRENT_PROCESSORS_ARRAY,
      currentProcessors,
    }))
    .catch((err) => {
      console.log(err);
      toastr.error('Error', err?.message)
    }),
  [
    ownDataOpsOnly,
    namespace,
    operationTypeToExecute,
    starredOpsOnly,
    numberOfStars,
    dtypesSelected,
  ]);

  useEffect(() => {
    fetchProcessors();
  }, [fetchProcessors]);

  return (
    <div className="data-operations-filters">
      <div className="data-operations-filters-create-link">
        <a
          href={`/new-project/classification/${operationClassification}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <p
            className={`${operationTypeToExecute}`}
          >
            Create new
            {' '}
            {operationClassification}
          </p>
        </a>
        <MTooltip position="bottom" message={`Link to the form to create a ${operationClassification}`} />
      </div>
      <p className="data-operations-filters-create-link-inst">
        This will open a new tab to create a new
        {' '}
        {operationClassification}
        {' '}
        repository
      </p>
      <hr />
      <p className="data-operations-filters-use-operator-inst">
        or use a
        {' '}
        {operationClassification}
        {' '}
        from the list
      </p>
      <button
        type="button"
        className="data-operations-filters-show-filters-btn"
        onClick={() => setFiltersVisible(!filtersVisible)}
      >
        <i className="fas fa-sliders-h" />
        {filtersVisible ? 'Hide ' : 'See '}
        filters
      </button>

      {filtersVisible && (
        <>
          <MCheckBox
            name="own-data-operators"
            labelValue={`Only owned ${operationClassification}`}
            callback={(...[,, val]) => setOwnDataOpsOnly(val)}
          />
          <MCheckBox
            name="only-starred-operators"
            labelValue={`Only starred ${operationClassification}`}
            callback={(...[,, val]) => setStarredeOpsOnly(val)}
          />
          {starredOpsOnly && (
            <div className="mt-3">
              <label htmlFor="min-stars-input">
                Minimum of stars
                <input
                  id="min-stars-input"
                  defaultValue={numberOfStars}
                  placeholder="2"
                  onChange={({ target: { value } }) => {
                    if (value === '' || value === '0') return;
                    setNumberOfStars(value);
                  }}
                  type="number"
                />
              </label>
            </div>
          )}
          <p style={{ margin: '1rem 0 0 0' }}>Filter by input datatype</p>
          <div className="data-operations-filters-checkbox-group">
            <MCheckBoxGroup
              name="data-operation-filters"
              className="data-operations-filters-checkbox-group-items"
              onSelect={(...[value]) => {
                setDtypesSelected(
                  dtypesSelected.includes(value)
                    ? dtypesSelected.filter((dtype) => dtype !== value)
                    : [...dtypesSelected, value],
                );
              }}
              values={dtypesSelected}
              options={dtypes.map((dtype, ind) => ({ label: toCamelCase(dtype), value: ind }))}
            />
          </div>
        </>
      )}
    </div>
  );
};

DataOperationFilters.propTypes = {
  operationTypeToExecute: string.isRequired,
};

export default DataOperationFilters;
