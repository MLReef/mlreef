import React from 'react';
import plus from '../../images/plus_01.svg';
import '../pipeline-view/pipelineView.css';
import Navbar from "../navbar/navbar";
import Input from '../input/input';
import ProjectContainer from '../projectContainer';
import { dataVisualizations } from "../../dataTypes";
import { SortableDataOperationsList } from '../pipeline-view/sortableDataOperationList';
import SelectDataPipelineModal from "../select-data-pipeline/selectDataPipelineModal";
import { DataOperationsList } from '../pipeline-view/dataOperationsList';
import { Instruction } from '../instruction/instruction';
import withPipelinesExecution from "./../withPipelinesExecution";

const EmptyDataVisualization = ({...props}) => {
    const project = props.project;
    const dataOperations = props.dataOperations;
    const showSelectFilesModal = props.showSelectFilesModal;
    const items = props.dataOperationsSelected;
    return (
        <div className="pipe-line-view">
            <SelectDataPipelineModal 
                project={props.project}
                branches={props.branches}
                files={props.files}
                selectDataClick={props.selectDataClick} 
                show={showSelectFilesModal} 
                filesSelectedInModal={props.filesSelectedInModal} 
                handleModalAccept={props.handleModalAccept}
            />
            <Navbar />
            <ProjectContainer project={project} activeFeature="data" folders={['Group Name', project.name, 'Data', 'Visualization']} />
            <Instruction
                titleText={"How to create a data visualization:"}
                paragraph={
                    `First, select your data you want to analyze. Then select one or multiple data visualizations from the right. 
                        After execution each visualization will be displayed in a new window.`
                }
            />
            <div className="pipe-line-execution-container flexible-div">
                <div className="pipe-line-execution">
                    <div className="header flexible-div">
                        <div className="header-left-items flexible-div">
                            <div>
                                <p>Visualization:</p>
                            </div>
                            <Input name="DataPipelineID" id="renaming-pipeline" placeholder="ProjectName" />
                        </div>
                        <div className="header-right-items flexible-div" >
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
                            Start by selecting your data file(s) you want to include <br /> in your data visualization.
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

                    <div id="text-after-files-selected" className="upload-file" style={{ display: 'none' }}>
                        <div style={{ width: '50%' }}>
                            <p style={{ margin: '6% 0% 6% 2%' }}>
                                <b>Data:&nbsp;&nbsp;{props.filesSelectedInModal.length} file(s) selected</b>
                            </p>
                        </div>
                        <div style={{ width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'right', marginRight: '2%' }}>
                            <button style={{ backgroundColor: 'white', border: 'none' }} onClick={() => { props.selectDataClick() }}><b> select data </b></button>
                        </div>
                    </div>

                    <SortableDataOperationsList items={items} onSortEnd={props.onSortEnd} />

                </div>

                <div className="pipe-line-execution tasks-list">
                    <div className="header">
                        <p>Select a visualization(s) from list:</p>
                    </div>
                    <div className="content">
                        <div className="filter-div flexible-div">
                            <Input name="selectDataOp" id="selectDataOp" placeholder="Search a visualization" />
                            <div className="search button pipe-line-active flexible-div" onClick={(e) => props.showFilters(e)}>
                                <img id="show-filters-button" src={plus} alt="" />
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
                                    Only own data operations
                                    <input type="checkbox" value={props.checkBoxOwnDataOperations}
                                        onChange={props.handleCheckMarkClick} id="checkBoxOwnDataOperations">
                                    </input>
                                    <span className="checkmark"></span>
                                </label>
                                <label className="customized-checkbox" >
                                    Only starred data operations
                                    <input type="checkbox" value={props.checkBoxStarredDataOperations}
                                        onChange={props.handleCheckMarkClick} id="checkBoxStarredDataOperations">
                                    </input>
                                    <span className="checkmark"></span>
                                </label>
                            </div>
                            <Input name="minOfStart" id="minOfStart" placeholder="Minimum of stars" />
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

export default withPipelinesExecution(EmptyDataVisualization, dataVisualizations);