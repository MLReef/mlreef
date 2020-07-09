import React, { useState } from 'react';
import { arrayOf, shape, string } from 'prop-types';
import { Link } from 'react-router-dom';
import './executePipeLineModal.scss';
import '../../css/genericModal.css';
import MSelect from 'components/ui/MSelect';
import MProgressBar from 'components/ui/MProgressBar';
import { ALGORITHM, OPERATION, VISUALIZATION } from 'dataTypes';
import createExperimentInProject, { createPipelineInProject } from '../../functions/pipeLinesHelpers';

const fakeMachinesToShow = [
  {
    label: 'Small CPU - (CPU: 8 cores, RAM 8 GB) - 2&euro; per hour',
    value: 1,
  },
  {
    label: 'Small GPU - (CPU: 8 cores, GPU: 1, RAM 16 GB) - 4&euro; per hour',
    value: 2,
  },
];

const ExecutePipelineModal = ({
  type,
  isShowing,
  toggle,
  dataOperationsSelected,
  filesSelectedInModal,
  projectId,
  backendId,
  branchName,
  dataInstanceName,
  jobName,
  branchSelected,
}) => {
  const [section, setSection] = useState(1);
  const [isFirstOptSelected, setIsFirstOptSelected] = useState(false);
  const [isSecondOptSelected, setIsSecondOptSelected] = useState(false);
  const [selectMachinesMess, setSelectMachinesMess] = useState(null);
  const [tuningMethod, setTuningMethod] = useState(null);
  function cleanForm() {
    setIsFirstOptSelected(false);
    setIsSecondOptSelected(false);
    setSection(1);
    toggle();
    setSelectMachinesMess('Select a machine...');
  }
  const pipelineType = type === OPERATION ? 'DATA' : 'VISUALISATION';
  const chooseExecutionType = () => {
    if (section === 1) {
      setSection(2);
      if (type === ALGORITHM) {
        createExperimentInProject(
          dataOperationsSelected,
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
          dataOperationsSelected,
        );
      }
    } else {
      cleanForm();
    }
  };
  return (
      <div  className={`modal modal-primary modal-lg dark-cover ${isShowing ? 'show' : ''}`}>
        <div className="modal-cover" onClick={() => cleanForm()}></div>
        <div className="modal-container d-flex" style={{ height: '40%', minHeight: 350, flexDirection: 'column' }}>
          <div className="modal-container-close">
            <button onClick={() => cleanForm()} className="btn btn-hidden fa fa-times" />
          </div>
          <div className="modal-header">
            <div>
              {section === 1
                ? 'Select output method for your'
                  + `${pipelineType === 'DATA' ? ' set of data instances ' : ' data visualization '}`
                  + `with ${filesSelectedInModal.length} data files selected`
                : 'Your new set of data intances is being created'}
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
                    <input type="radio" checked={isFirstOptSelected} id="show-first-opt" onChange={() => {}} />
                    <p style={{ marginLeft: '1em' }} id="paragraph-op1">
                      {`Create a new ${pipelineType === 'DATA'
                        ? ' set of data instances '
                        : ' data visualization '} in your data repository`}
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
                          className="mt-2"
                          label="Select a hyperparameter tuning method:"
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
                    onClick={(e) => {
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
                    }}
                  >
                    <input type="radio" checked={isSecondOptSelected} onChange={() => {}} />
                    <p style={{ marginLeft: '1em' }} id="paragraph-op2">
                      Launch Jupyter notebook on your web browser to execute the
                      pipeline locally on your machine
                    </p>
                  </div>
                </div>
              </>
            )}
            {section === 2 && (
              <div className="execute-pipeline-modal-section2">
                <p>
                  {type === VISUALIZATION
                    ? 'Data visualization '
                    : ' Data instance '}
                </p>
                <div className="execute-pipeline-modal-section2-status mt-4">
                  <MProgressBar color="info" />
                </div>
                <div className="mt-4">
                  <p className="t-center">
                    You can close this window, your task will run on the background under
                    <b> “Insights/Tasks”</b>
                  </p>
                  <p className="t-center">
                    or jump directly to your newly created data instance
                    <b> data_instance_name.</b>
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
                  Abort
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
                  <Link to={type === ALGORITHM
                    ? `/my-projects/${projectId}/-/experiments`
                    : `/my-projects/${projectId}/-/datasets`}
                  >
                    <button id="show-machines" type="button" className="btn btn-primary">
                      Ok
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
  httpUrlToRepo: string.isRequired,
  filesSelectedInModal: arrayOf(shape({})),
};

ExecutePipelineModal.defaultProps = {
  filesSelectedInModal: [],
}

export default ExecutePipelineModal;
