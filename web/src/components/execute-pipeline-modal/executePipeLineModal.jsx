import React, { useState } from 'react';
import './executePipeLineModal.css';
import '../../css/globalStyles.css';
import '../../css/genericModal.css';
import $ from 'jquery';
import ArrowButton from '../arrow-button/arrowButton';
import traiangle01 from '../../images/triangle-01.png';
import createPipelineInProject from '../../functions/pipeLinesHelpers';
import MSelect from 'components/ui/MSelect';


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
  isShowing,
  toggle,
  amountFilesSelected,
  dataOperationsSelected,
  filesSelectedInModal,
  http_url_to_repo,
  projectId,
  branchName,
  dataInstanceName,
  jobName,
  branchSelected,
}) => {
  const [section, setSection] = useState(1);
  const [isFirstOptSelected, setIsFirstOptSelected] = useState(false);
  const [isSecondOptSelected, setIsSecondOptSelected] = useState(false);
  const [showMachines, setShowMachines] = useState(false);
  const [selectMachinesMess, setSelectMachinesMess] = useState(null);
  const [tuningMethod, setTuningMethod] = useState(null);
  const isADataVisualizationPipe = dataInstanceName.includes('data-visualization');
  function cleanForm() {
    setIsFirstOptSelected(false);
    setIsSecondOptSelected(false);
    setShowMachines(false);
    setSection(1);
    toggle();
    setSelectMachinesMess('Select a machine...');
  }
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
                  + `${isADataVisualizationPipe ? ' data visualization ' : ' set of data instances '}`
                  + `with ${amountFilesSelected} data files selected`
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
                      {`Create a new ${isADataVisualizationPipe ? 'data visualization ' : ' set of data instances '} in your data repository`}
                    </p>
                  </div>

                  {isFirstOptSelected && (
                    <div className="row pl-3">
                      <div className="col-8">
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
                      Launch Jupyter notebook on your web browser to execute the pipeline locally on your machine
                    </p>
                  </div>
                </div>
              </>
            )}
            {section === 2 && (
              <div style={{ padding: '1em 0 1em 3em', cursor: 'pointer', height: '70%' }}>
                <p>
                  {isADataVisualizationPipe ? 'Data visualization: ' : 'Data instance: '}
                  <b>{dataInstanceName}</b>
                </p>
                <div style={{
                  backgroundColor: 'white',
                  width: '96%',
                  height: '2em',
                  borderRadius: '0.5em',
                  border: '0.4px solid #32AFC3',
                }}
                >
                  <div
                    id="progress-bar"
                    style={{
                      backgroundColor: '#32afc3',
                      height: '100%',
                      width: '40%',
                      borderRadius: 'inherit',
                    }}
                  />
                </div>
                <div style={{ display: 'flex' }}>
                  <div style={{ width: '50%', display: 'inherit', alignContent: '' }}>
                    <p style={{ fontSize: '0.8em', width: '100%', textAlign: 'start' }}>Loading files...</p>
                  </div>
                  <div style={{ width: '50%', display: 'inherit', alignContent: '' }}>
                    <p style={{ fontSize: '0.8em', width: '90%', textAlign: 'end' }}>ETA: 12min 45sec</p>
                  </div>
                </div>
                <p>
                  You can close this window, your task will run on the background.
                </p>

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
                <button
                  id="show-machines"
                  type="button"
                  onClick={() => {
                    if (section === 1) {
                      setSection(2);
                      createPipelineInProject(
                        dataOperationsSelected,
                        filesSelectedInModal,
                        http_url_to_repo,
                        projectId,
                        jobName,
                        branchName,
                        dataInstanceName,
                        branchSelected,
                      );
                    } else {
                      cleanForm();
                    }
                  }}
                  className="btn btn-primary"
                >
                  {section === 1
                    ? 'Execute'
                    : 'Ok'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default ExecutePipelineModal;
