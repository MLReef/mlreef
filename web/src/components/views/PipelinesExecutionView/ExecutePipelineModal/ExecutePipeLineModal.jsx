import React, { useState } from 'react';
import MProgressBar from 'components/ui/MProgressBar';
import { arrayOf, shape, string, bool, func } from 'prop-types';
import { Link } from 'react-router-dom';
import MRadio from 'components/ui/MRadio';
import './executePipeLineModal.scss';
import MSelect from 'components/ui/MSelect';
import { ALGORITHM, OPERATION, VISUALIZATION } from 'dataTypes';
import createExperimentInProject, { randomNameGenerator, createPipelineInProject } from '../../../../functions/pipeLinesHelpers';

const fakeMachinesToShow = [
  {
    label: 'Small CPU - (CPU: 8 cores, RAM 8 GB)',
    value: 1,
  },
  {
    label: 'Small GPU - (CPU: 8 cores, GPU: 1, RAM 16 GB)',
    value: 2,
  },
];

const operationsMetaData = {
  ALGORITHM: {
    commandName: 'experiment',
    jobName: 'model-experiment',
    decription: 'experiment',
    prettyName: 'Experiment',
  },
  OPERATION: {
    commandName: 'data-pipeline',
    jobName: 'data-pipeline',
    decription: 'set of dataset',
    prettyName: 'Data set',
  },
  VISUALIZATION: {
    commandName: 'data-visualization',
    jobName: 'data-pipeline',
    decription: 'data visualization',
    prettyName: 'Data Visualization',
  },
};

const ExecutePipelineModal = ({
  type,
  isShowing,
  toggle,
  processorsSelected,
  filesSelectedInModal,
  projectNamespace,
  projectSlug,
  backendId,
  branchSelected,
}) => {
  const [section, setSection] = useState(1);
  const [isFirstOptSelected, setIsFirstOptSelected] = useState(false);
  const [isSecondOptSelected, setIsSecondOptSelected] = useState(false);
  const [selectMachinesMess, setSelectMachinesMess] = useState(null);
  const [tuningMethod, setTuningMethod] = useState(null);
  const uniqueName = randomNameGenerator();
  const {
    jobName, commandName, decription: operationDescription, prettyName,
  } = operationsMetaData[type];
  const pipelineType = type === OPERATION ? 'DATA' : 'VISUALIZATION';
  const branchName = `${commandName}/${uniqueName}`;
  const generatedOperationName = `${commandName}/${uniqueName}`;
  function cleanForm() {
    setIsFirstOptSelected(false);
    setIsSecondOptSelected(false);
    setSection(1);
    toggle();
    setSelectMachinesMess('Select a machine...');
  }

  const chooseExecutionType = () => {
    if (section === 1) {
      setSection(2);
      if (type === ALGORITHM) {
        createExperimentInProject(
          processorsSelected,
          backendId,
          branchName,
          branchSelected,
          filesSelectedInModal,
        );
      } else {
        createPipelineInProject(
          backendId,
          branchSelected,
          pipelineType,
          filesSelectedInModal,
          processorsSelected,
        );
      }
    } else {
      cleanForm();
    }
  };

  const choosRedirectView = () => {
    let redirectRoute = `/${projectNamespace}/${projectSlug}/-/experiments`;
    if (type === VISUALIZATION) redirectRoute = `/${projectNamespace}/${projectSlug}/-/visualizations`;
    else if (type === OPERATION) redirectRoute = `/${projectNamespace}/${projectSlug}/-/datasets`;

    return redirectRoute;
  };

  return (
    <div className={`modal modal-primary modal-lg dark-cover ${isShowing ? 'show' : ''}`}>
      <div className="modal-cover" onClick={() => cleanForm()} />
      <div className="modal-container d-flex" style={{ height: '40%', minHeight: 350, flexDirection: 'column' }}>
        <div className="modal-container-close">
          <button onClick={() => cleanForm()} className="btn btn-hidden fa fa-times" />
        </div>
        <div className="modal-header">
          <div>
            {section === 1
              ? 'Select output method for your'
                  + ` ${operationDescription} `
                  + `with ${filesSelectedInModal.length} data file(s) selected`
              : 'Your new set of data sets is being created'}
          </div>
        </div>
        <div className="modal-content">

          {section === 1 && (
          <>
            <div style={{ flex: 1, cursor: 'pointer' }}>
              <div
                style={{ display: 'flex', alignItems: 'center' }}
                onClick={() => {
                  setIsFirstOptSelected(!isFirstOptSelected);
                  setIsSecondOptSelected(false);
                  const po1 = document.getElementById('paragraph-op1');
                  if (po1) {
                    po1.style.fontWeight = 700;
                    document.getElementById('paragraph-op2').style.fontWeight = 100;
                  }
                }}
              >
                <MRadio
                  id="show-first-opt"
                  color="primary"
                  checked={isFirstOptSelected}
                  onChange={() => {}}
                />
                <p id="paragraph-op1">
                  {`Create a new ${operationDescription} in your data repository`}
                </p>
              </div>

              {isFirstOptSelected && (
              <div className="row pl-3">
                <div id="t-machine-selector" className="col-8">
                  <MSelect
                    label="Select a machine..."
                    options={fakeMachinesToShow}
                    value={selectMachinesMess}
                    onSelect={setSelectMachinesMess}
                  />
                  {jobName === 'model-experiment' && (
                  <MSelect
                    disabled
                    className="mt-2"
                    label="Soon available - Select a hyperparameter tuning method:"
                    onSelect={setTuningMethod}
                    value={tuningMethod}
                    options={[
                      { label: 'Simple execution', value: '1' },
                      { label: 'Grid search', value: '2' },
                      { label: 'Bayesian', value: '3' },
                    ]}
                  />
                  )}
                </div>
              </div>
              )}
              <div
                id="second-option-execution-modal"
                style={{
                  display: 'flex', alignItems: 'center', cursor: 'pointer', marginTop: 0,
                }}
               /*
               ---- Requested to be disabled ---
               onClick={() => {
                  const secondOptExecModal = document.getElementById('second-option-execution-modal');
                  if (secondOptExecModal) {
                    secondOptExecModal.style.marginTop = '0';
                  }
                  setIsFirstOptSelected(false);
                  setIsSecondOptSelected(!isSecondOptSelected);
                  const po1 = document.getElementById('paragraph-op1');
                  if (po1) {
                    po1.style.fontWeight = 100;
                    document.getElementById('paragraph-op2').style.fontWeight = 700;
                  }
                }} */
              >
                <MRadio
                  color="primary"
                  disabled
                  checked={isSecondOptSelected}
                  onChange={() => {}}
                />
                <p id="paragraph-op2">
                  Soon available: Download your pipeline and execute it locally using docker
                </p>
              </div>
            </div>
          </>
          )}
          {section === 2 && (
          <div className="execute-pipeline-modal-section2">
            <p>
              {`${prettyName}: ${generatedOperationName}`}
            </p>
            <div className="execute-pipeline-modal-section2-status mt-4">
              <MProgressBar color="info" />
            </div>
            <div className="mt-4">
              <p className="t-center">
                You can close this window, your task will run on the background under
                <b> “Insights/Jobs”</b>
              </p>
              <p className="t-center">
                {`or jump directly to your newly created instance ${generatedOperationName}`}
              </p>
            </div>
          </div>
          )}
        </div>
        <div className="modal-actions">
          <div className="row w-100 mx-4 mb-3">
            <div className="col-6 t-left" style={{ display: 'flex', width: '50%' }}>
              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={() => cleanForm()}
              >
                Return to pipeline
              </button>
            </div>
            <div className="col-6 t-right" style={{ width: '50%', display: 'flex', justifyContent: 'flex-end' }}>
              {section === 1 ? (
                <button
                  id="show-machines"
                  type="button"
                  onClick={chooseExecutionType}
                  className="btn btn-primary"
                >
                  Execute
                </button>
              ) : (
                <Link to={choosRedirectView()}>
                  <button id="show-machines" type="button" className="btn btn-primary">
                    Proceed to results
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ExecutePipelineModal.propTypes = {
  filesSelectedInModal: arrayOf(shape({})),
  type: string.isRequired,
  isShowing: bool.isRequired,
  toggle: func.isRequired,
  processorsSelected: arrayOf(shape({})).isRequired,
  projectNamespace: string.isRequired,
  projectSlug: string.isRequired,
  backendId: string.isRequired,
  branchSelected: string,
};

ExecutePipelineModal.defaultProps = {
  filesSelectedInModal: [],
  branchSelected: 'master',
};

export default ExecutePipelineModal;
