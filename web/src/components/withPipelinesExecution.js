import React from 'react';
import minus from './../images/minus.svg';
import plus from './../images/plus_01.svg';
import arrayMove from 'array-move';

const withPipelineExecution = (WrappedComponent, operationsToExecute) =>
    class extends React.Component {
        constructor(props){
            super(props);
            const root = JSON.parse(localStorage.getItem("persist:root"));
            const selectedProject = JSON.parse(root.projects).selectedProject;
            const projectBranches = JSON.parse(root.branches);
            this.state = {
                branchSelected: null,
                project: selectedProject,
                checkBoxOwnDataOperations: false,
                checkBoxStarredDataOperations: false,
                idCardSelected: null,
                showFilters: false,
                showForm: false,
                isShowingExecutePipelineModal: false,
                dataOperations: operationsToExecute,
                showSelectFilesModal: false,
                dataOperationsSelected: [],
                filesSelectedInModal: [],
                branches: projectBranches
            }
                
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
        
        handleModalAccept = (e, filesSelected, branchSelected) => {
            this.setState({
                branchSelected: branchSelected,
                filesSelectedInModal: filesSelected, 
                showSelectFilesModal: !this.state.showSelectFilesModal
            });
            document.getElementById("text-after-files-selected").style.display = "flex";
            document.getElementById("upload-files-options").style.display = "none"; 
            document.getElementsByTagName("body").item(0).style.overflow = 'scroll';
        };
            
        handleExecuteBtn = () => this.toggleExecutePipeLineModal();
    
        toggleExecutePipeLineModal(){
            const isShowingExecutePipelineModal = !this.state.isShowingExecutePipelineModal;
            this.setState({isShowingExecutePipelineModal: isShowingExecutePipelineModal});
        }
        
        render = () => (
            <WrappedComponent 
                project={this.state.project} 
                branches={this.state.branches}
                branchSelected={this.state.branchSelected}
                dataOperationsSelected={this.state.dataOperationsSelected}
                filesSelectedInModal={this.state.filesSelectedInModal}
                dataOperations={this.state.dataOperations}
                showSelectFilesModal={this.state.showSelectFilesModal}
                isShowingExecutePipelineModal={this.state.isShowingExecutePipelineModal}
                onSortEnd={this.onSortEnd}
                handleCheckMarkClick={this.handleCheckMarkClick}
                drop={this.drop}
                createDivToContainOperationSelected={this.createDivToContainOperationSelected}
                copyDataOperationEvent={this.copyDataOperationEvent}
                deleteDataOperationEvent={this.deleteDataOperationEvent}
                allowDrop={this.allowDrop}
                hideInstruction={this.hideInstruction}
                showFilters={this.showFilters}
                handleDragStart={this.handleDragStart}
                selectDataClick={this.selectDataClick}
                whenDataCardArrowButtonIsPressed={this.whenDataCardArrowButtonIsPressed}
                showAdvancedOptionsDivDataPipeline={this.showAdvancedOptionsDivDataPipeline}
                handleModalAccept={this.handleModalAccept}
                handleExecuteBtn={this.handleExecuteBtn}
                toggleExecutePipeLineModal={this.toggleExecutePipeLineModal}
            />
        )
}


export default withPipelineExecution;