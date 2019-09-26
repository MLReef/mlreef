import React, { useState } from 'react';
import "./executePipeLineModal.css";
import "../../css/global-styles.css";
import "../../css/generic-modal.css";
import ArrowButton from '../arrow-button/arrow-button';
import traiangle01 from '../../images/triangle-01.png';
import $ from 'jquery';
import './../../css/global-styles.css';

const fakeMachinesToShow = [
    $.parseHTML("Small CPU - (CPU: 8 cores, RAM 8 GB) - 2&euro; per hour")[0].data,
    $.parseHTML("Medium CPU - (CPU: 8 cores, RAM 16 GB) - 4&euro; per hour")[0].data
];

const ExecutePipelineModal = ({
    isShowing,
    toggle,
    amountFilesSelected,
    handleExecuteModalBtnNextPressed
}) => {
    const [section, setSection] = useState(1);
    const [isFirstOptSelected, setIsFirstOptSelected] = useState(false);
    const [isSecondOptSelected, setIsSecondOptSelected] = useState(false);
    const [showMachines, setShowMachines] = useState(false);
    const [selectMachinesMess, setSelectMachinesMess] = useState("Select a machine...");
    
    function cleanForm() {
        setIsFirstOptSelected(false);
        setIsSecondOptSelected(false);
        setShowMachines(false);
        setSection(1);
        toggle();
        setSelectMachinesMess("Select a machine...");
    }

    return isShowing
    ? (
        <div className="generic-modal">
            <div className="modal-content" style={{height: '25%', minHeight: 250}}>
                <div className="title light-green-button">
                    <div style={{padding: '0 3em'}}>
                        <p>
                            {section === 1 
                                ? `Select output method for your data pipeline with ${amountFilesSelected} data files selected`
                                : `Your new set of data intances is being created`
                            }
                        </p>
                    </div>                        
                    <div id="x-button-div">
                        <button onClick={() => cleanForm() } className="light-green-button"> <b>X</b> </button>
                    </div>
                </div>
                {section === 1 && <>
                    <div style={{padding: '1em 0 1em 3em', cursor: 'pointer', height: '50%' }}>
                        <div 
                            style={{display: 'flex', alignItems: 'center'}} 
                            onClick={ () => { 
                                document.getElementById("second-option-execution-modal").style.marginTop = !isFirstOptSelected ? '3em': '0';
                                setIsFirstOptSelected(!isFirstOptSelected);
                                setIsSecondOptSelected(false);
                            }}
                        >
                            <input type="radio" checked={isFirstOptSelected} />
                            <p style={{marginLeft: "1em", fontWeight: "700"}}>Create a new set of data instances in your data repository</p>
                        </div>
                        {isFirstOptSelected &&
                            <div style={{width: '50%', borderRadius: '0.5em', marginLeft: '2.5em', position: 'absolute', zIndex: '2', backgroundColor: 'white'}}
                                className="drop-down-select blue-border-on-hover"
                            >
                                <div style={{display: 'flex', alignItems: 'center'}} 
                                    onClick={() => {
                                        $(`#machines-drop-down-btn`).click();
                                    }}
                                >
                                    <div style={{width: '90%'}}>
                                        <p className="machines-paragraph">{selectMachinesMess}</p>
                                    </div>
                                    <div style={{width: '10%', display: 'flex', justifyContent: 'flex-end'}}>
                                        <ArrowButton 
                                            imgPlaceHolder={traiangle01}
                                            callback={() => {
                                                setShowMachines(!showMachines);
                                            }}
                                            params={{}}
                                            id={'machines-drop-down-btn'}
                                        />
                                    </div>
                                </div>
                                {showMachines && 
                                    <ul style={{margin: 0, padding: 0, listStyleType: 'none'}}>
                                        {fakeMachinesToShow.map((machine, index) =>
                                            <li key={`machine-${index}`} id={`machine-${index}`} onClick={(e) => {
                                                $(`#machines-drop-down-btn`).click();
                                                setSelectMachinesMess($.parseHTML(machine)[0].data);
                                            }}>
                                                <p className="blue-background-on-hover machines-paragraph">
                                                    {machine}
                                                </p>
                                            </li>
                                        )}
                                    </ul>
                                }
                            </div>
                        }
                        <div id="second-option-execution-modal"
                            style={{display: 'flex', alignItems: 'center', cursor: 'pointer', marginTop: 0}} 
                            onClick={ () => {
                                document.getElementById("second-option-execution-modal").style.marginTop = '0';
                                setIsFirstOptSelected(false);
                                setIsSecondOptSelected(!isSecondOptSelected);
                            }}
                        >
                            <input type="radio" checked={isSecondOptSelected} />
                            <p style={{marginLeft: "1em", fontWeight: "700"}}>
                                Launch Jupyter notebook on your web browser to execute the pipeline locally on your machine
                            </p>
                        </div>
                        
                    </div>
                    
                </>}
                {section === 2 && <div style={{padding: '1em 0 1em 3em', cursor: 'pointer', height: '50%' }}>
                    <p>Data instance: <b>DI_ProjectName_1</b></p>
                    <div style={{
                            backgroundColor: 'white',
                            width: '96%',
                            height: '2em',
                            borderRadius: '0.5em',
                            border: '0.4px solid #32AFC3',
                        }}
                    >
                        <div id="progress-bar"
                            style={{
                                backgroundColor: '#32afc3',
                                height: '100%',
                                width: `40%`,
                                borderRadius: 'inherit'
                            }} 
                        />
                    </div>
                    <div style={{display: 'flex', }}>
                        <div style={{width: '50%', display: 'inherit', alignContent: ''}}>
                            <p style={{ fontSize: '0.8em', width: '100%', textAlign: 'start'}}>Loading files...</p>
                        </div>
                        <div style={{width: '50%', display: 'inherit', alignContent: ''}}>
                            <p style={{ fontSize: '0.8em', width: '90%', textAlign: 'end' }}>ETA: 12min 45sec</p>
                        </div>
                    </div>

                    <p>You can close this window, your task will run on the background under <b>"Insights/tasks"</b></p>

                </div>}
                <div style={{display: 'flex', margin: '1em 3em'}}>
                        <div style={{width: '50%', }}>
                            <button className="white-button" style={{padding: '3px 3em'}} onClick={() => cleanForm() }>Abort</button>
                        </div>
                        <div style={{width: '50%', display: 'flex', justifyContent: 'flex-end'}}>
                            <button 
                                onClick={() => {
                                    if(section === 1){
                                        setSection(2);
                                    } else {
                                        cleanForm();
                                        handleExecuteModalBtnNextPressed();
                                    }
                                }}
                                style={{borderRadius: '0.3vw', padding: '3px 3em'}} 
                                className="round light-green-button">
                                    {section === 1 
                                        ? "Next"
                                        : "Execute"
                                    }
                            </button>
                        </div>
                    </div>
            </div>
        </div>
    )
    : null
}

export default ExecutePipelineModal;