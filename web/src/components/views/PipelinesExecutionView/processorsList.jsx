import React, { useState, useContext, useMemo } from 'react';
import {
  shape, string,
} from 'prop-types';
import { projectClassificationsProps, PUBLIC } from 'dataTypes';
import MProjectCardTypes from '../../ui/MProjectCard/MProjectCardTypes';
import ArrowButton from '../../ui/MArrowButton/arrowButton';
import { DataPipelinesContext } from './DataPipelineHooks/DataPipelinesProvider';
import { ADD_NEW_PROCESSOR, SET_PROCESSOR_SELECTED } from './DataPipelineHooks/actions';

const NoProjectsSign = ({ operationClassification }) => (
  <h4 style={{ textAlign: 'center' }}>
    No
    {' '}
    {operationClassification}
    {' '}
    to execute
  </h4>
);

const DataProcessorsList = ({
  processors,
  operationClassification, 
  operationTypeToExecute, 
  dispatch,
}) => useMemo(() => processors.length > 0 ? processors.map((processor) => (
  <Processor
    key={`processors-available-${processor.id}`}
    processorData={processor}
    operationTypeToExecute={operationTypeToExecute}
    dispatch={dispatch}
  />
))
  : <NoProjectsSign operationClassification={operationClassification} />,
[processors, operationClassification, operationTypeToExecute, dispatch],
)

const ProcessorsList = ({ operationTypeToExecute, namespace }) => {
  const [{ currentProcessors }, dispatch] = useContext(DataPipelinesContext);
  const operationClassification = projectClassificationsProps
    .filter((cl) => cl.typeOfProcessor === operationTypeToExecute.toUpperCase())[0]?.classification;

  const publicProcessors = currentProcessors.filter((cp) => cp.visibilityScope === PUBLIC && cp.nameSpace !== namespace);
  const privateProcessors = currentProcessors.filter((cp) => cp.nameSpace === namespace);

  return (
    <div className="data-operations-list scroll-styled">
      <div className="data-operations-list-separation">
        <p>
          my models
        </p>
      </div>
      <DataProcessorsList 
        processors={privateProcessors}
        operationClassification={operationClassification}
        operationTypeToExecute={operationTypeToExecute} 
        dispatch={dispatch}
      />
      <div className="data-operations-list-separation">
        <hr />
        <p>
          public models
        </p>
      </div>
      <DataProcessorsList 
        processors={publicProcessors}
        operationClassification={operationClassification}
        operationTypeToExecute={operationTypeToExecute} 
        dispatch={dispatch}
      />
    </div>
  );
};

export const Processor = ({ processorData, operationTypeToExecute, dispatch }) => {
  const [shouldDescriptionRender, setShouldDescriptionRender] = useState(false);
  const {
    nameSpace,
    slug,
    inputDataTypes,
    stars,
  } = processorData;

  return (
    <div
      data-testid={processorData.id}
      id={processorData.id}
      draggable
      onDragStart={() => dispatch({ type: SET_PROCESSOR_SELECTED, processorData })}
      onDragEnd={() => dispatch({ type: SET_PROCESSOR_SELECTED, processorData: null })}
      onDoubleClick={() => {
        dispatch({ type: SET_PROCESSOR_SELECTED, processorData });
        dispatch({ type: ADD_NEW_PROCESSOR });
        dispatch({ type: SET_PROCESSOR_SELECTED, processorData: null });
      }}
      className={`data-operations-list-item ${operationTypeToExecute} round-border-button`}
    >
      <div className="header d-flex">
        <div className="processor-title">
          <p className="m-0"><b>{processorData.name}</b></p>
          <p>
            Created by
            {' '}
            <b>{nameSpace}</b>
          </p>
          <div>
            {inputDataTypes && <MProjectCardTypes input types={inputDataTypes} />}
          </div>
        </div>
        <div className="data-oper-options d-flex">
          <div className="d-flex">
            <img src={stars > 0 ? '/images/svg/unstar.svg' : '/images/star.png'} className="mr-2" alt="stars" />
            <p>
              {stars}
            &nbsp;
            </p>
          </div>
          <div>
            <ArrowButton
              callback={() => setShouldDescriptionRender(!shouldDescriptionRender)}
            />
          </div>
        </div>
      </div>
      {shouldDescriptionRender && (
      <div className="processor-content">
        <p>
          {processorData.description}
        </p>
        <br />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <p className="m-0">
            <b>
              <a target="_blank" rel="noopener noreferrer" href={`/${nameSpace}/${slug}`}>
                View Repository
              </a>
            </b>
          </p>
        </div>
      </div>
      )}
    </div>
  );
};

const procDataShape = shape({
  name: string.isRequired,
  description: string.isRequired,
  inputDataType: string.isRequired,
});

Processor.propTypes = {
  processorData: procDataShape.isRequired,
};

export default ProcessorsList;
