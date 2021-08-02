import React, {
  useContext,
  useEffect,
  useState,
} from 'react';
import './ProcessorFilters.scss';
import { toastr } from 'react-redux-toastr';
import { toCamelCase } from 'functions/helpers';
import useLoading from 'customHooks/useLoading';
import MTooltip from 'components/ui/MTooltip';
import MCheckBox from 'components/ui/MCheckBox/MCheckBox';
import MCheckBoxGroup from 'components/ui/MCheckBoxGroup';
import MTags from 'components/ui/MTags';
import { projectClassificationsProps } from 'dataTypes';
import { string } from 'prop-types';
import { DataPipelinesContext } from '../DataPipelineHooks/DataPipelinesProvider';
import { addInformationToProcessors, fetchProcessorsPaginatedByType } from '../DataPipelineHooks/DataPipelinesReducerAndFunctions';
import { UPDATE_CURRENT_PROCESSORS_ARRAY } from '../DataPipelineHooks/actions';
import { buildBody, dtypes } from './functionsAndConstants';

const DataOperationFilters = (props) => {
  const { namespace, operationTypeToExecute, inputDataTypes = [] } = props;
  const [, dispatch] = useContext(DataPipelinesContext);
  const operationClassification = projectClassificationsProps
    .filter((cl) => cl.typeOfProcessor === operationTypeToExecute.toUpperCase())[0]?.classification;
  const [dtypesSelected, setDtypesSelected] = useState(
    inputDataTypes.map(inputDataType => dtypes.findIndex(item => item === inputDataType))
  );
  const [starredOpsOnly, setStarredeOpsOnly] = useState(false);
  const [ownDataOpsOnly, setOwnDataOpsOnly] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [numberOfStars, setNumberOfStars] = useState(1);
  const [projectName, setProjectName] = useState('');

  const fetchProcessors = () => fetchProcessorsPaginatedByType(
    operationTypeToExecute.toUpperCase(),
    buildBody(
      projectName,
      ownDataOpsOnly,
      namespace,
      starredOpsOnly,
      numberOfStars,
      dtypesSelected.map((ind) => dtypes[ind]),
    ),
  )
    .then((projects) => projects.map((pr) => ({
      ...pr,
      processorSelected: 0,
      processors: addInformationToProcessors(pr.processors),
    })))
    .then((currentProcessors) => dispatch({
      type: UPDATE_CURRENT_PROCESSORS_ARRAY,
      currentProcessors,
    }))
    .catch((err) => {
      toastr.error('Error', err?.message);
    });

  const [loading, executeFetch] = useLoading(fetchProcessors);

  useEffect(() => {
    executeFetch();
  }, [
    projectName,
    ownDataOpsOnly,
    namespace,
    operationTypeToExecute,
    starredOpsOnly,
    numberOfStars,
    dtypesSelected,
  ]);

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
      <input
        id="search-by-name-input"
        type="text"
        placeholder="Type a repository name and hit enter"
        defaultValue=""
        onKeyUp={(e) => {
          if (e.key === 'Enter' && !loading) {
            setProjectName(e.target.value);
          }
        }}
      />
      <button
        type="button"
        className="data-operations-filters-show-filters-btn"
        onClick={() => setFiltersVisible(!filtersVisible)}
      >
        <i className="fas fa-sliders-h" />
        {filtersVisible ? 'Hide ' : 'See '}
        filters
      </button>
      <div style={{ display: filtersVisible ? '' : 'none' }}>
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
      </div>
      <MTags
        tags={dtypesSelected.map((sdInd) => ({ label: dtypes[sdInd], id: sdInd }))}
        onClick={(tag) => setDtypesSelected(dtypesSelected.filter((dtype) => dtype !== tag.id))}
      />
    </div>
  );
};

DataOperationFilters.propTypes = {
  operationTypeToExecute: string.isRequired,
};

export default DataOperationFilters;
