import React, { useState } from 'react';
import {
  shape, string, func, arrayOf,
} from 'prop-types';
import ArrowButton from '../../arrow-button/arrowButton';

const ProcessorsList = ({
  processors,
  handleDragStart,
}) => (
  <div id="data-operations-list" className="scroll-styled">
    {processors && processors.map((processor) => (
      <Processor
        key={`processors-available-${processor.internalProcessorId}`}
        processorData={processor}
        handleDragStart={handleDragStart}
      />
    ))}
  </div>
);

export const Processor = ({ processorData, handleDragStart }) => {
  const [shouldDescriptionRender, setShouldDescriptionRender] = useState(false);
  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, processorData)}
      className="data-operations-item round-border-button shadowed-element"
    >
      <div className="header flexible-div">
        <div className="processor-title">
          <p className="bold-text">{processorData.name}</p>
          <p>
            Created by
            &nbsp;
            <span className="bold-text">Keras</span>
          </p>
        </div>
        <div className="data-oper-options flexible-div">
          <div>
            <p>
              {processorData.starCount}
            &nbsp;
            </p>
          </div>
          <div>
            <ArrowButton
              callback={() => { setShouldDescriptionRender(!shouldDescriptionRender); }}
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
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <p>
            Data type:
            {' '}
            <b>{processorData.inputDataType}</b>
          </p>
          <p style={{ marginRight: '11px' }}>
            <b>
              {processorData.name === 'Resnet50'
                ? (
                  <a href="http://staging.mlreef.com/mlreef/commons-resnet-50">
                    Source Code
                  </a>
                )
                : 'Source Code'}
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
  handleDragStart: func.isRequired,
};

ProcessorsList.propTypes = {
  processors: arrayOf(procDataShape).isRequired,
  handleDragStart: func.isRequired,
};

export default ProcessorsList;
