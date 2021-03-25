import React, { useState, useContext, useMemo } from 'react';
import {
  shape, string,
} from 'prop-types';
import { projectClassificationsProps } from 'dataTypes';
import MProjectCardTypes from '../../ui/MProjectCard/MProjectCardTypes';
import ArrowButton from '../../arrow-button/arrowButton';
import { DataPipelinesContext } from './DataPipelineHooks/DataPipelinesProvider';
import { ADD_NEW_PROCESSOR, SET_PROCESSOR_SELECTED } from './DataPipelineHooks/actions';

const ProcessorsList = ({ operationTypeToExecute }) => {
  const [{ currentProcessors }, dispatch] = useContext(DataPipelinesContext);
  const operationClassification = projectClassificationsProps
    .filter((cl) => cl.typeOfProcessor === operationTypeToExecute.toUpperCase())[0]?.classification;

  return (
    <div className="data-operations-list scroll-styled">
      {useMemo(() => currentProcessors.length > 0 ? currentProcessors.map((processor) => (
        <Processor
          key={`processors-available-${processor.id}`}
          processorData={processor}
          operationTypeToExecute={operationTypeToExecute}
          dispatch={dispatch}
        />
      ))
        : (
          <h4 style={{ textAlign: 'center' }}>
            No
            {' '}
            {operationClassification}
            {' '}
            to execute
          </h4>
        ),
      [currentProcessors, operationClassification],
      )}
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
