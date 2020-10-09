import React, { useState, useEffect, useContext } from 'react';
import {
  shape, string,
} from 'prop-types';
import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import MProjectCardTypes from '../../ui/MProjectCard/MProjectCardTypes';
import ArrowButton from '../../arrow-button/arrowButton';
import { DataPipelinesContext } from './DataPipelineHooks/DataPipelinesProvider';
import { SET_PROCESSOR_SELECTED } from './DataPipelineHooks/actions';

const projectInstance = new ProjectGeneralInfoApi();

const ProcessorsList = () => {
  const [{ currentProcessors }] = useContext(DataPipelinesContext);
  return (
    <div id="data-operations-list" className="scroll-styled">
      {currentProcessors && currentProcessors.map((processor) => (
        <Processor
          key={`processors-available-${processor.internalProcessorId}`}
          processorData={processor}
        />
      ))}
    </div>
)};

export const Processor = ({ processorData }) => {
  const [shouldDescriptionRender, setShouldDescriptionRender] = useState(false);
  const [codeProjectInformation, setCodeProjectInformation] = useState({});
  const {
    gitlab_namespace: nameSpace,
    slug,
    input_data_types: inputDataTypes,
    stars_count: stars,
  } = codeProjectInformation;

  const [, dispatch] = useContext(DataPipelinesContext);
  useEffect(() => {
    projectInstance.getCodeProjectById(processorData.codeProjectId)
      .then((res) => setCodeProjectInformation(res));
  }, [processorData]);

  function handleDragStart(e) {
    const dt = e.dataTransfer;
    dt.setData('text/plain', e.currentTarget.id);
    dt.effectAllowed = 'move';
    dispatch({ type: SET_PROCESSOR_SELECTED, processorData });
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => dispatch({ type: SET_PROCESSOR_SELECTED, processorData: null })}
      className="data-operations-item round-border-button shadowed-element"
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
