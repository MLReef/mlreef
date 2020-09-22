import React, { useState, useEffect } from 'react';
import {
  shape, string, func, arrayOf,
} from 'prop-types';
import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import ArrowButton from '../../arrow-button/arrowButton';

const projectInstance = new ProjectGeneralInfoApi();

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
  const [codeProjectURL, setCodeProjectURL] = useState({});
  const { gitlab_namespace: nameSpace, slug } = codeProjectURL;

  useEffect(() => {
    projectInstance.getCodeProjectById(processorData.codeProjectId)
      .then((res) => setCodeProjectURL(res));
  }, [processorData]);

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, processorData)}
      className="data-operations-item round-border-button shadowed-element"
    >
      <div className="header d-flex">
        <div className="processor-title">
          <p><b>{processorData.name}</b></p>
          <p>
            Created by
            &nbsp;
            <span><b>Keras</b></span>
          </p>
        </div>
        <div className="data-oper-options d-flex">
          <div>
            <p>
              {processorData.starCount}
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
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <p>
            Data type:
            {' '}
            <b>{processorData.inputDataType}</b>
          </p>
          <p style={{ marginRight: '11px' }}>
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
  handleDragStart: func.isRequired,
};

ProcessorsList.propTypes = {
  processors: arrayOf(procDataShape).isRequired,
  handleDragStart: func.isRequired,
};

export default ProcessorsList;
