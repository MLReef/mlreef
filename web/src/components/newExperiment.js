import React from 'react';
import plus from './../images/plus_01.svg';
import './pipeline-view/pipelineView.css';
import Navbar from "./navbar/navbar";
import Input from './input/input';
import ProjectContainer from './projectContainer';
import {SortableDataOperationsList} from './pipeline-view/sortableDataOperationList';
import SelectDataPipelineModal from "./select-data-pipeline/selectDataPipelineModal";
import {DataOperationsList} from './pipeline-view/dataOperationsList';
import {Instruction} from "./instruction/instruction";
import uuidv1 from 'uuid/v1';
import ExecutePipelineModal from "./execute-pipeline-modal/executePipeLineModal";
import withPipelineExecution from './withPipelinesExecution';
import { experiments } from '../dataTypes';

const NewExperiment = ({...props}) => {
    const project = props.project;
    const dataOperations = props.dataOperations;
    const showSelectFilesModal = props.showSelectFilesModal;
    const items = props.dataOperationsSelected;
    let operationsSelected = items.length;
    operationsSelected++;
    const uuidCodeForBranch = (uuidv1()).split("-")[0];
    const branchName = `experiment/${uuidCodeForBranch}`;
    const dataInstanceName = `experiment/${uuidCodeForBranch}`;
    const jobName = "model-experiment";
    
    return (
        <div className="pipe-line-view">
            <SelectDataPipelineModal 
                files={props.files}
                selectDataClick={props.selectDataClick} 
                show={showSelectFilesModal} 
                filesSelectedInModal={props.filesSelectedInModal} 
                handleModalAccept={props.handleModalAccept}
            />
            <ExecutePipelineModal
                isShowing={props.isShowingExecutePipelineModal} 
                amountFilesSelected={props.filesSelectedInModal.length}
                toggle={props.toggleExecutePipeLineModal}
                dataOperationsSelected={props.dataOperationsSelected}
                filesSelectedInModal={props.filesSelectedInModal}
                http_url_to_repo={project.http_url_to_repo}
                projectId={project.id}
                branchName={branchName}
                dataInstanceName={dataInstanceName}
                jobName={jobName}
            />
            <Navbar/>
            <ProjectContainer project={project} activeFeature="experiments" folders = {['Group Name', project.name, 'Data', 'Pipeline']}/>
            <Instruction 
                titleText={"How to create a new experiment:"}
                paragraph={
                    `First, select your data you want to do your experiment on. Then select one or multiple algorithms from the right. 
                        If needed, you can adapt the parameters of your algorithm directly`
                }
                />
            <div className="pipe-line-execution-container flexible-div">
                <div className="pipe-line-execution">
                    <div className="header flexible-div">
                        <div className="header-left-items flexible-div">
                            <div>
                                <p>Experiment:</p>
                            </div>
                            <Input name="DataPipelineID" id="renaming-pipeline" placeholder="EX_Project_1"/>
                        </div>
                        <div className="header-right-items flexible-div" onClick={props.handleExecuteBtn}>
                            <div id="execute-button" className="header-button round-border-button right-item flexible-div">
                                Execute
                            </div>
                            <div className="header-button round-border-button right-item flexible-div">
                                Save
                            </div>
                            <div className="header-button round-border-button right-item flexible-div">
                                Load
                            </div>
                        </div>
                    </div>
                    <div id="upload-files-options" className="upload-file">
                        <p className="instruction">
                            Start by selecting your data file(s) you want to include <br/> in your experiments.
                        </p>
                        <p id="data">
                            Data:
                        </p>
                        
                        <div className="data-button-container flexible-div">
                            <div id="select-data-btn" onClick={props.selectDataClick}>
                                Select data
                            </div>
                        </div>
                    </div>

                    <div id="text-after-files-selected" className="upload-file" style={{display: 'none'}}>
                        <div style={{width: '50%'}}>
                            <p style={{margin: '6% 0% 6% 2%'}}>
                                <b>Data:&nbsp;&nbsp;{props.filesSelectedInModal.length} file(s) selected</b>
                            </p>
                        </div>
                        <div style={{width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'right', marginRight: '2%'}}>
                            <button style={{backgroundColor: 'white', border: 'none'}} onClick={() => {props.selectDataClick()}}><b> select data </b></button>
                        </div>
                    </div>
                    
                    <SortableDataOperationsList items={items} onSortEnd={props.onSortEnd}/>
                    <div id="drop-zone" onDrop={props.drop} onDragOver={props.allowDrop} >
                        <p style={{marginLeft: '10px', fontWeight: 600}}>{`Algo.${operationsSelected}:`}</p>
                        <img src={plus} alt="" style={{height: '80px', marginLeft: '60px'}}/>
                        <p style={{margin: '0', padding: '0', width: '100%', textAlign: 'center'}}> 
                            Drag and drop an algorithm from the right into your 
                            <br/>experiment pipeline or <b>create a new one</b>
                        </p>
                    </div>
                    
                </div>

                <div className="pipe-line-execution tasks-list">
                    <div className="header">
                        <p>Select an algorithm from list:</p>
                    </div>
                    <div className="content">
                        <div className="filter-div flexible-div">
                            <Input name="selectDataOp" id="selectDataOp" placeholder="Search a data operation"/>
                            <div className="search button pipe-line-active flexible-div" onClick={(e) => props.showFilters(e)}>
                                <img id="show-filters-button" src={plus} alt=""/>
                            </div>
                        </div>

                        <div id="filters" className="invisible">

                            <select className="data-operations-select round-border-button">
                                <option>All data types</option>
                                <option>Images data</option>
                                <option>Text data</option>
                                <option>Tabular data</option>
                            </select>
                            
                            <div className="checkbox-zone">
                                <label className="customized-checkbox" >
                                    Only own algorithms
                                    <input type="checkbox" value={props.checkBoxOwnDataOperations} 
                                        onChange={props.handleCheckMarkClick} id="checkBoxOwnDataOperations"> 
                                    </input>
                                    <span className="checkmark"></span> 
                                </label>
                                <label className="customized-checkbox" >
                                    Only starred algorithms
                                    <input type="checkbox" value={props.checkBoxStarredDataOperations} 
                                        onChange={props.handleCheckMarkClick} id="checkBoxStarredDataOperations">
                                    </input>
                                    <span className="checkmark"></span>
                                </label>
                            </div>
                            <Input name="minOfStart" id="minOfStart" placeholder="Minimum of stars"/>
                        </div>

                        <DataOperationsList 
                            handleDragStart={props.handleDragStart} 
                            whenDataCardArrowButtonIsPressed={props.whenDataCardArrowButtonIsPressed}
                            dataOperations={dataOperations}
                        />
                    </div>
                </div>
            </div>
        </div>
    )

}

export default withPipelineExecution(NewExperiment, experiments);