import React, { useState } from 'react';
import './executePipeLineModal.css';
import '../../css/globalStyles.css';
import '../../css/genericModal.css';
import $ from 'jquery';
import ArrowButton from '../arrow-button/arrowButton';
import traiangle01 from '../../images/triangle-01.png';
import {
  createPipelineInProject,
} from '../../functions/pipeLinesHelpers';

const fakeMachinesToShow = [
  $.parseHTML('Small CPU - (CPU: 8 cores, RAM 8 GB) - 2&euro; per hour')[0].data,
  $.parseHTML('Small GPU - (CPU: 8 cores, GPU: 1, RAM 16 GB) - 4&euro; per hour')[0].data,
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
  const [selectMachinesMess, setSelectMachinesMess] = useState('Select a machine...');

  function cleanForm() {
    setIsFirstOptSelected(false);
    setIsSecondOptSelected(false);
    setShowMachines(false);
    setSection(1);
    toggle();
    setSelectMachinesMess('Select a machine...');
  }

  return isShowing
    ? (
      <div className="generic-modal">
        <div className="modal-content" style={{ height: '50%', minHeight: 250 }}>
          <div className="title light-green-button">
            <div style={{ padding: '0 3em' }}>
              <p>
                {section === 1
                  ? `Select output method for your data pipeline with ${amountFilesSelected} data files selected`
                  : 'Your new set of data intances is being created'}
              </p>
            </div>
            <div id="x-button-div">
              <button onClick={() => cleanForm()} className="light-green-button">
                {' '}
                <b>X</b>
                {' '}
              </button>
            </div>
          </div>
          {section === 1 && (
            <>
              <div style={{ padding: '1em 0 1em 3em', cursor: 'pointer', height: '60%' }}>
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
                  <p style={{ marginLeft: '1em' }} id="paragraph-op1">Create a new set of data instances in your data repository</p>
                </div>
                {isFirstOptSelected
                            && (
                              <>
                                <div
                                  style={{
                                    width: '50%', borderRadius: '0.5em', marginLeft: '2.5em', position: 'absolute', zIndex: '2', backgroundColor: 'white',
                                  }}
                                  className="drop-down-select blue-border-on-hover"
                                >
                                  <div
                                    style={{ display: 'flex', alignItems: 'center' }}
                                    onClick={() => {
                                      $('#machines-drop-down-btn').click();
                                    }}
                                  >
                                    <div style={{ width: '90%' }}>
                                      <p className="machines-paragraph">{selectMachinesMess}</p>
                                    </div>
                                    <div style={{ width: '10%', display: 'flex', justifyContent: 'flex-end' }}>
                                      <ArrowButton
                                        imgPlaceHolder={traiangle01}
                                        callback={() => {
                                          setShowMachines(!showMachines);
                                        }}
                                        params={{}}
                                        id="machines-drop-down-btn"
                                      />
                                    </div>
                                  </div>
                                  {showMachines
                                        && (
                                        <ul style={{ margin: 0, padding: 0, listStyleType: 'none' }} id="machines-list">
                                          {fakeMachinesToShow.map((machine, index) => (
                                            <li
                                              key={`machine-${index}`}
                                              id={`machine-${index}`}
                                              onClick={(e) => {
                                                $('#machines-drop-down-btn').click();
                                                setSelectMachinesMess($.parseHTML(machine)[0].data);
                                              }}
                                            >
                                              <p className="blue-background-on-hover machines-paragraph">
                                                {machine}
                                              </p>
                                            </li>
                                          ))}
                                        </ul>
                                        )}
                                </div>
                                {jobName === 'model-experiment' && (
                                <div>
                                  <p style={{ fontSize: '0.9em', margin: '5em 0em 0em 3em' }}>Select a hyperparameter tuning method:</p>
                                  <div style={{ display: 'flex', marginLeft: '1.8em' }}>
                                    <div style={{ display: 'inherit' }}>
                                      <input id="execution-radio-input-1" type="radio" onChange={() => {}} />
                                      <p onClick={() => { $('#execution-radio-input-1').click(); }}>Simple execution</p>
                                    </div>
                                    <div style={{ display: 'inherit' }}>
                                      <input id="execution-radio-input-2" type="radio" onChange={() => {}} />
                                      <p onClick={() => { $('#execution-radio-input-2').click(); }}>Grid search</p>
                                    </div>
                                    <div style={{ display: 'inherit' }}>
                                      <input id="execution-radio-input-3" type="radio" onChange={() => {}} />
                                      <p onClick={() => { $('#execution-radio-input-3').click(); }}>Bayesian</p>
                                    </div>
                                  </div>
                                </div>
                                )}
                                {jobName !== 'model-experiment' && <div style={{ height: 30 }} />}
                              </>
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
Data instance:
                <b>DI_ProjectName_1</b>
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
You can close this window, your task will run on the background under
                <b>"Insights/tasks"</b>
              </p>

            </div>
          )}
          <div style={{ display: 'flex', margin: '0em 3em', alignItems: 'first baseline' }}>
            <div style={{ display: 'flex', width: '50%' }}>
              <button className="white-button" style={{ padding: '3px 3em' }} onClick={() => cleanForm()}>Abort</button>
            </div>
            <div style={{ width: '50%', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                id="show-machines"
                onClick={() => {
                  if (section === 1) {
                    setSection(2);
                    createPipelineInProject(
                      dataOperationsSelected,
                      branchSelected,
                      filesSelectedInModal,
                      http_url_to_repo,
                      projectId,
                      jobName,
                      branchName,
                      dataInstanceName,
                    );
                  } else {
                    cleanForm();
                  }
                }}
                style={{ borderRadius: '0.3vw', padding: '3px 3em' }}
                className="round light-green-button"
              >
                {section === 1
                  ? 'Execute'
                  : 'Ok'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
    : null;
};

export default ExecutePipelineModal;
