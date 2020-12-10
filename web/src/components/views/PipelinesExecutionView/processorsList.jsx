import React, { useState, useContext } from 'react';
import {
  shape, string,
} from 'prop-types';
import MProjectCardTypes from '../../ui/MProjectCard/MProjectCardTypes';
import ArrowButton from '../../arrow-button/arrowButton';
import { DataPipelinesContext } from './DataPipelineHooks/DataPipelinesProvider';
import { SET_PROCESSOR_SELECTED } from './DataPipelineHooks/actions';

const ProcessorsList = ({ operationTypeToExecute }) => {
  const [{ currentProcessors }] = useContext(DataPipelinesContext);
  return (
    <div id="data-operations-list" className="scroll-styled">
      {currentProcessors && currentProcessors.map((processor) => (
        <Processor
          key={`processors-available-${processor.internalProcessorId}`}
          processorData={processor}
          operationTypeToExecute={operationTypeToExecute}
        />
      ))}
    </div>
  );
};

export const Processor = ({ processorData, operationTypeToExecute }) => {
  const [shouldDescriptionRender, setShouldDescriptionRender] = useState(false);
  const {
    nameSpace,
    slug,
    inputDataTypes,
    stars,
  } = processorData;

  const [, dispatch] = useContext(DataPipelinesContext);

  return (
    <div
      draggable
      onDragStart={() => dispatch({ type: SET_PROCESSOR_SELECTED, processorData })}
      onDragEnd={() => dispatch({ type: SET_PROCESSOR_SELECTED, processorData: null })}
      className={`data-operations-item ${operationTypeToExecute} round-border-button`}
    >
      <div className="header d-flex">
        <div className="processor-title">
          <p className="m-0"><b>{processorData.name}</b></p>
          <p>
            Created by
            &nbsp;
            <span><b>Keras</b></span>
          </p>
          <div>
            {inputDataTypes && <MProjectCardTypes input types={inputDataTypes} />}
          </div>
        </div>
        <div className="data-oper-options d-flex">
          <div className="d-flex">
            <img src={stars > 0 ? '/images/svg/unstar.svg' : '/images/star.png'} alt="stars" />
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
