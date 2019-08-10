import React from 'react';
import { connect } from 'react-redux';
import minus from '../images/minus.svg';
import plus from '../images/plus_01.svg';
import '../css/pipe-line-view.css';
/* import DataOperationsItem from './data-operations-item'; */
import Navbar from "./navbar/navbar";
import Input from './input';
import ProjectContainer from './projectContainer';
import advice_01 from '../images/advice-01.png';
import star_01 from './../images/star_01.svg';
import triangle_01 from './../images/triangle-01.png';


class PipeLineView extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            checkBoxOwnDataOperations: false,
            checkBoxStarredDataOperations: false,
            idCardSelected: null,
            showFilters: false,
            dataOperations: [
                {title: "Augment", username: "UserName 1", starCount: "243", index: 1},
                {title: "Random crop", username: "UserName 2", starCount: "201", index: 2},
                {title: "Random rotate", username: "UserName 3", starCount: "170", index: 3},
                {title: "Convert to RGB", username: "UserName 4", starCount: "199", index: 4},
                {title: "Resize_img", username: "UserName 5", starCount: "203", index: 4}
            ]
        }

        this.handleCheckMarkClick = this.handleCheckMarkClick.bind(this);
        this.drop = this.drop.bind(this);
        this.allowDrop = this.allowDrop.bind(this);
        this.handleDragStart = this.handleDragStart.bind(this);

    }

    componentDidMount(){
        document.getElementById("show-filters-button").style.width = '80%';
    }

    handleCheckMarkClick(e){
        const newState = this.state;
        newState[e.currentTarget.id] = !this.state[e.currentTarget.id];

        const span = e.currentTarget.nextSibling;
        newState[e.currentTarget.id] 
            ? span.classList.add("pipe-line-active") 
            : span.classList.remove("pipe-line-active");

        this.setState(newState);
    }

    drop(e){
        e.preventDefault();
    }

    allowDrop(e){
        const dropZone = document.elementFromPoint(e.clientX, e.clientY);
        if(dropZone.id === "data-operations-list" || dropZone.id === "drop-zone"){            
            dropZone.appendChild(document.getElementById(this.state.idCardSelected));
        }
        e.preventDefault();
    }

    hideInstruction = () => {
        document.getElementById("instruction-pipe-line").classList.add("invisible");
    }

    showFilters(e){
        const filters = document.getElementById("filters"); 
        const showFilters = !this.state.showFilters;
        this.setState({showFilters:  showFilters})
        document.getElementById("show-filters-button")
        if(showFilters){
            document.getElementById("show-filters-button").src = minus;
            filters.classList.remove("invisible");
            document.getElementById("show-filters-button").style.width = '40%';
        } else {
            document.getElementById("show-filters-button").src = plus;
            document.getElementById("show-filters-button").style.width = '80%';
            filters.classList.add("invisible");
        }
    }

    handleDragStart(e){
        const newState = {...this.state};
        newState.idCardSelected = e.currentTarget.id;
        this.setState(newState);
        const dt = e.dataTransfer;
        dt.setData('text/plain', e.currentTarget.id);
        dt.effectAllowed = 'move';

    } 

    render(){
        const project = this.props.project;
        const dataOperations = this.state.dataOperations;
        return (
            <div className="pipe-line-view">
                <Navbar/>
                <ProjectContainer activeFeature="data" folders = {['Group Name', project.name, 'Data', 'Pipeline']}/>
                <div id="instruction-pipe-line">
                    <div id="icon">
                        <img src={advice_01} alt=""/>
                    </div>
                    <div id="instruction">
                        <p id="title"> <b>How to create a data processing pipeline:</b></p>
                        <p>
                            First, select your data you want to process. Then select one or multiple data operations from the right. The result of a data pipeline
                            is a data instance, which you can use directly to train a model or merge it into a branch.
                        </p>
                    </div>
                    <div id="xButton">
                        <button onClick={() => this.hideInstruction()}>
                            X
                        </button>
                    </div>   
                </div>
                <div className="pipe-line-execution-container flexible-div">
                    <div className="pipe-line-execution">
                        <div className="header flexible-div">
                        <div className="header-left-items flexible-div">
                            Data Pipeline:
                            <div id="renaming-pipeline" className="header-button round-border-button">
                                Renaming pipeline
                            </div>
                        </div>

                            <div className="header-right-items flexible-div">
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

                        <div className="upload-file">
                            <p className="instruction">
                                Start by selecting your data file(s) you want to include <br/> in your data processing pipeline.
                            </p>
                            <p id="data">
                                Data:
                            </p>
                            
                            <div className="data-button-container flexible-div">
                                <div id="select-data-btn">
                                    Select data
                                </div>
                            </div>
                        </div>

                        <div id="drop-zone" onDrop={this.drop} onDragOver={this.allowDrop}>

                        </div>
                    </div>

                    <div className="pipe-line-execution tasks-list">
                        <div className="header">
                            <p>Select a data operations from list:</p>
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
                                
                                <div id="checkbox-zone">
                                    <label className="customized-checkbox" >
                                        Only own data operations
                                        <input type="checkbox" value={this.state.checkBoxOwnDataOperations} onChange={this.handleCheckMarkClick} id="checkBoxOwnDataOperations"> 
                                        </input>
                                        <span className="checkmark"></span> 
                                    </label>
                                    <label className="customized-checkbox" >
                                        Only starred data operations
                                        <input type="checkbox" value={this.state.checkBoxStarredDataOperations} onChange={this.handleCheckMarkClick} id="checkBoxStarredDataOperations">
                                        </input>
                                        <span className="checkmark"></span>
                                    </label>
                                </div>
                                <Input name="minOfStart" id="minOfStart" placeholder="Minimum of stars"/>
                            </div>

                            <div id="data-operations-list" onDrop={this.drop} onDragOver={this.allowDrop} >
                                {dataOperations.map( (dataOperation, index) => 
                                        <div draggable={true} onDragStart={this.handleDragStart}
                                            className="data-operations-item round-border-button shadowed-element" id={`data-operations-item-${index}`}>
                                            <div className="header flexible-div">
                                                <div id="title-content">
                                                    <p className="bold-text">{dataOperation.title}</p>
                                                </div>
                                                <div className="data-oper-options flexible-div">
                                                    <div><img alt="" src={star_01} /></div>
                                                    <div><p>&nbsp;{dataOperation.starCount}&nbsp;</p></div>
                                                    <div>
                                                        <img alt="" src={triangle_01}/>
                                                    </div>
                                                </div>
                                            </div>
                                            <p>Created by <span className="bold-text">{dataOperation.username}</span></p>
                                        </div>
                                    )
                                }
                            </div>    
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state){
    return {
        project: state.project
    };
}

export default connect(mapStateToProps)(PipeLineView);