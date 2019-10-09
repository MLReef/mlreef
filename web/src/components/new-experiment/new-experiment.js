import React, {Component} from 'react';
import {connect} from 'react-redux';
import minus from '../../images/minus.svg';
import plus from '../../images/plus_01.svg';
import '../pipeline-view/pipe-line-view.css';
import Navbar from "../navbar/navbar";
import Input from '../input';
import ProjectContainer from '../projectContainer';
import {SortableDataOperationsList} from '../pipeline-view/sortable-data-operation-list';
import SelectDataPipelineModal from "../select-data-pipeline/select-data-pipeline-modal";
import arrayMove from 'array-move';
import {FLOAT, INT, STRING} from "../../data-types";
import {DataOperationsList} from '../pipeline-view/data-operations-list';
import {Instruction} from "../instruction/instruction";
import filesApi from "./../../apis/FilesApi";
import {
    createPipelineInProject
} from './../../functions/pipeLinesHelpers';
import uuidv1 from 'uuid/v1';
import ExecutePipelineModal from "./../execute-pipeline-modal/executePipeLineModal";

class NewExperiment extends Component {
    constructor(props){
        super(props);
        this.state = {
            project: this.props.projects.selectedProject,
            files: null,
            checkBoxOwnDataOperations: false,
            checkBoxStarredDataOperations: false,
            idCardSelected: null,
            showFilters: false,
            showForm: false,
            dataOperations: [
                {
                    title: "Resnet 50", username: "Keras", starCount: "243", index: 1,
                    command: "resnet50",
                    description: "ResNet50 is a 50 layer Residual Network.",
                    showDescription:false, showAdvancedOptsDivDataPipeline: false, dataType: "Images", 
                    params: {
                        standard: [
                            {name: "output_path", dataType: STRING, required: true, commandName: "output-path"},
                            {name: "input_height", dataType: INT, required: true, commandName: "height"},
                            {name: "input_width", dataType: INT, required: true, commandName: "width"},
                        ],
                        advanced: [
                            {name: "channels", dataType: INT, required: false, commandName: "channels"},
                            {name: "Use pre-trained", dataType: FLOAT, required: false, commandName: "use-pretrained"},
                            {name: "epochs", dataType: FLOAT, required: false, commandName: "epochs"},
                            {name: "batch-size", dataType: FLOAT, required: false, commandName: "batch-size"}
                        ]
                    }
                }/* ,
                {
                    title: "Inception", username: "GoogLeNet", starCount: "201", index: 2,
                    description: "Inception approximates a sparse CNN with a normal dense construction Also, it uses convolutions of different sizes to capture details at varied scales(5X5, 3X3, 1X1).",
                    showDescription:false, showAdvancedOptsDivDataPipeline: false, dataType: "Text", 
                    params: {
                        standard: []
                    }
                },
                {
                    title: "VGG16", username: "VGG group", starCount: "170", index: 3,
                    description: "The VGG convolutional layers are followed by 3 fully connected layers. The width of the network starts at a small value of 64 and increases by a factor of 2 after every sub-sampling/pooling layer. It achieves the top-5 accuracy of 92.3 % on ImageNet.",
                    showDescription:false, showAdvancedOptsDivDataPipeline: false, dataType: "Something Else", 
                    params: {
                        standard: []
                    }
                } */
            ],
            showSelectFilesModal: false,
            dataOperationsSelected: [],
            filesSelectedInModal: [],
            isShowingExecutePipelineModal: false
        };
        filesApi.getFilesPerProject(
            this.props.projects.selectedProject.id, 
            "",
            false, 
            "gitlab.com",
            "master"
        ).then(res => this.setState({files: res}))
        .catch(err => console.log(err));
        this.handleCheckMarkClick = this.handleCheckMarkClick.bind(this);
        this.drop = this.drop.bind(this);
        this.allowDrop = this.allowDrop.bind(this);
        this.handleDragStart = this.handleDragStart.bind(this);
        this.selectDataClick = this.selectDataClick.bind(this);
        this.handleModalAccept = this.handleModalAccept.bind(this);
        this.copyDataOperationEvent = this.copyDataOperationEvent.bind(this);
        this.deleteDataOperationEvent = this.deleteDataOperationEvent.bind(this);
        this.handleExecuteBtn = this.handleExecuteBtn.bind(this);
        this.toggleExecutePipeLineModal = this.toggleExecutePipeLineModal.bind(this);
    }

    componentDidMount(){
        document.getElementById("show-filters-button").style.width = '80%';
    }
   
    onSortEnd = ({oldIndex, newIndex}) => this.setState(({dataOperationsSelected}) => ({
        dataOperationsSelected: arrayMove(dataOperationsSelected, oldIndex, newIndex)
    }));
              
    handleCheckMarkClick(e){
        const newState = this.state;
        newState[e.currentTarget.id] = !this.state[e.currentTarget.id];

        const span = e.currentTarget.nextSibling;
        newState[e.currentTarget.id] 
            ? span.classList.add("pipe-line-active") 
            : span.classList.remove("pipe-line-active");

        this.setState(newState);
    }

    drop = e => e.preventDefault();
    
    createDivToContainOperationSelected = (index, e) => {  
        const array = this.state.dataOperationsSelected;
        const dataCardSelected = JSON.stringify(this.state.dataOperations[index]);
        if(array
            .filter(
                    arr => JSON.stringify(arr) === dataCardSelected
                )
                .length === 0
            ){
            const dataOperationCopy = this.state.dataOperations[index];
            dataOperationCopy.copyDataOperationEvent = this.copyDataOperationEvent;
            dataOperationCopy.deleteDataOperationEvent = this.deleteDataOperationEvent;
            array.push(dataOperationCopy);
            this.setState({dataOperationsSelected: array});
        }
    };

    copyDataOperationEvent(e){
        const array = this.state.dataOperationsSelected;
        const value = {...array[parseInt(e.target.id.split("-")[3]) - 1]};
        
        value.index = this.state.dataOperationsSelected.length - 1;
        array.push(value);

        this.setState({dataOperationsSelected: array});
    }

    deleteDataOperationEvent(e){
        const array = this.state.dataOperationsSelected;
        array.splice(parseInt(e.target.id.split("-")[3]) - 1, 1);

        this.setState({dataOperationsSelected: array});
    }

    allowDrop = e => {
        const dropZone = document.elementFromPoint(e.clientX, e.clientY);
        if(dropZone.id === "drop-zone"){
            const index = this.state.idCardSelected.substr(21, this.state.idCardSelected.length);
            const cardSelected = document.getElementById(this.state.idCardSelected);
            if(cardSelected){
                this.createDivToContainOperationSelected(index, e);
            }
        }
        
        e.preventDefault();
    };

    hideInstruction = () =>
        document.getElementById("instruction-pipe-line").classList.add("invisible");
    
    showFilters = () => {
        const filters = document.getElementById("filters"); 
        const showFilters = !this.state.showFilters;
        this.setState({showFilters:  showFilters});
        const filtersBtn = document.getElementById("show-filters-button");
        if(showFilters){
            filtersBtn.src = minus;
            filters.classList.remove("invisible");
            filtersBtn.style.width = '40%';
        } else {
            filtersBtn.src = plus;
            filtersBtn.style.width = '80%';
            filters.classList.add("invisible");
        }
    };

    handleDragStart(e){
        const newState = {...this.state};
        newState.idCardSelected = e.currentTarget.id;
        this.setState(newState);
        const dt = e.dataTransfer;
        dt.setData('text/plain', e.currentTarget.id);
        dt.effectAllowed = 'move';
    } 
    
    selectDataClick = () => {
        this.setState({showSelectFilesModal: !this.state.showSelectFilesModal});
    };
    
    whenDataCardArrowButtonIsPressed = (e, params) => {
        const desc = document.getElementById(`description-data-operation-item-${params.index}`);
        const parentDropZoneContainerId = document.getElementById(`data-operations-item-${params.index}`).parentNode.id;
        const newState = this.state.dataOperations[params.index];
        const dataOpForm = document.getElementById(`data-operation-form-${params.index}`);
        
        if(parentDropZoneContainerId === 'data-operations-list'){
            newState.showDescription = !newState.showDescription;
            
            this.state.dataOperations[params.index].showDescription 
                ? desc.style.display = "unset"
                : desc.style.display = "none"
        } else {
            newState.showForm = !newState.showForm;
            
            this.state.dataOperations[params.index].showForm 
                ? dataOpForm.style.display = 'unset'
                : dataOpForm.style.display = 'none'
        }    
        this.setState(newState);
    };

    showAdvancedOptionsDivDataPipeline = (e, params) => {
        const newState = this.state.dataOperations[params.index];
        const advancedOptsDiv = document.getElementById(`advanced-opts-div-${params.index}`);

        newState.showAdvancedOptsDivDataPipeline = !newState.showAdvancedOptsDivDataPipeline;
        
        newState.showAdvancedOptsDivDataPipeline
            ? advancedOptsDiv.style.display = 'unset'
            : advancedOptsDiv.style.display = 'none';
        
        this.setState({newState});
    };
    
    handleModalAccept = (e, filesSelected) => {
        this.setState({filesSelectedInModal: filesSelected, showSelectFilesModal: !this.state.showSelectFilesModal});
        document.getElementById("text-after-files-selected").style.display = "flex";
        document.getElementById("upload-files-options").style.display = "none"; 
        document.getElementsByTagName("body").item(0).style.overflow = 'scroll';
    };

    handleExecuteBtn = () => {
        this.toggleExecutePipeLineModal();    
    }

    toggleExecutePipeLineModal(){
        const isShowingExecutePipelineModal = !this.state.isShowingExecutePipelineModal;
        this.setState({isShowingExecutePipelineModal: isShowingExecutePipelineModal});
    }
    
    handleExecuteModalBtnNextPressed = () => {
        const uuidCodeForBranch = (uuidv1()).split("-")[0];
        const branchName = `experiment/${uuidCodeForBranch}`;
        const dataInstanceName = `experiment/${uuidCodeForBranch}`;

        createPipelineInProject(
            this.state.dataOperationsSelected,
            this.state.filesSelectedInModal,
            this.state.project.http_url_to_repo,
            this.state.project.id,
            "model-experiment",
            branchName,
            dataInstanceName
        );
    }

    render = () => {
        const project = this.state.project;
        const dataOperations = this.state.dataOperations;
        const showSelectFilesModal = this.state.showSelectFilesModal;
        const items = this.state.dataOperationsSelected;
        let operationsSelected = items.length;
        operationsSelected++; 
        
        return (
            <div className="pipe-line-view">
                <SelectDataPipelineModal 
                    files={this.state.files}
                    selectDataClick={this.selectDataClick} 
                    show={showSelectFilesModal} 
                    filesSelectedInModal={this.state.filesSelectedInModal} 
                    handleModalAccept={this.handleModalAccept}
                />
                <ExecutePipelineModal
                    isShowing={this.state.isShowingExecutePipelineModal} 
                    amountFilesSelected={this.state.filesSelectedInModal.length}
                    toggle={this.toggleExecutePipeLineModal}
                    handleExecuteModalBtnNextPressed={this.handleExecuteModalBtnNextPressed}
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
                            <div className="header-right-items flexible-div" onClick={this.handleExecuteBtn}>
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
                                <div id="select-data-btn" onClick={this.selectDataClick}>
                                    Select data
                                </div>
                            </div>
                        </div>

                        <div id="text-after-files-selected" className="upload-file" style={{display: 'none'}}>
                            <div style={{width: '50%'}}>
                                <p style={{margin: '6% 0% 6% 2%'}}>
                                    <b>Data:&nbsp;&nbsp;{this.state.filesSelectedInModal.length} file(s) selected</b>
                                </p>
                            </div>
                            <div style={{width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'right', marginRight: '2%'}}>
                                <button style={{backgroundColor: 'white', border: 'none'}} onClick={() => {this.selectDataClick()}}><b> select data </b></button>
                            </div>
                        </div>
                        
                        <SortableDataOperationsList items={items} onSortEnd={this.onSortEnd}/>
                        <div id="drop-zone" onDrop={this.drop} onDragOver={this.allowDrop} >
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
                                <div className="search button pipe-line-active flexible-div" onClick={(e) => this.showFilters(e)}>
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
                                        <input type="checkbox" value={this.state.checkBoxOwnDataOperations} 
                                            onChange={this.handleCheckMarkClick} id="checkBoxOwnDataOperations"> 
                                        </input>
                                        <span className="checkmark"></span> 
                                    </label>
                                    <label className="customized-checkbox" >
                                        Only starred algorithms
                                        <input type="checkbox" value={this.state.checkBoxStarredDataOperations} 
                                            onChange={this.handleCheckMarkClick} id="checkBoxStarredDataOperations">
                                        </input>
                                        <span className="checkmark"></span>
                                    </label>
                                </div>
                                <Input name="minOfStart" id="minOfStart" placeholder="Minimum of stars"/>
                            </div>

                            <DataOperationsList 
                                handleDragStart={this.handleDragStart} 
                                whenDataCardArrowButtonIsPressed={this.whenDataCardArrowButtonIsPressed}
                                dataOperations={dataOperations}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state){
    return {
        fileData: state.file,
        projects: state.projects
    };
}

export default connect(
    mapStateToProps
)(NewExperiment);