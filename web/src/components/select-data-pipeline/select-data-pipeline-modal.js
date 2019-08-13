import React, {Component} from 'react';
import PropTypes from 'prop-types';
import "./select-data-pipeline-modal.css";
import Input from "../input";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as fileActions from "../../actions/fileActions";
import folderIcon from "../../images/folder_01.svg";
import fileIcon from "../../images/file_01.svg";
import traiangle01 from "../../images/triangle-01.png";
import ArrowButton from "../arrow-button/arrow-button";

class SelectDataPipelineModal extends Component{
    constructor(props){
        super(props);

        this.state = {
            show: this.props.show,
            files: this.props.files
        }

        this.handleCloseButton = this.handleCloseButton.bind(this);
    }

    Branches = ["Master", "feature/28-repo", "feature/41-pipeline"];

    componentWillReceiveProps(nextProps){
        this.setState({
            show: nextProps.show
        });
    }

    handleCloseButton(e){
        this.props.selectDataClick();
        document.getElementsByTagName("body").item(0).style.overflow = 'scroll';
    }

    handleBranch = (e, params) =>  {
        e.target.focus();
        this.setState({ isOpen: !this.state.isOpen });
    }
      
    render(){
        if(!this.state.show){
            return null;
        }
        document.getElementsByTagName("body").item(0).style.overflow = 'hidden';
        return(
            <div className="select-data-pipeline-modal">
                <div className="modal-content">
                    <div className="title light-green-button">
                        <div>
                            <p>Select data to pre-process in your current data pipeline.</p>
                        </div>
                        <div id="x-button-div">
                            <button onClick={this.handleCloseButton} className="light-green-button"> <b>X</b> </button>
                        </div>
                    </div>
                    <br />
                    <br />
                    <br />
                    <div id="buttons">
                        <div id="left-div">
                            <div className="reference">
                            <ArrowButton placeholder={"Master"} imgPlaceHolder={traiangle01} callback={this.handleBranch}/>
                            {this.state.isOpen && (
                                <div className="select-branch" onBlur={this.handleBlur}>
                                <div
                                    style={{
                                    margin: "0 50px",
                                    fontSize: "14px",
                                    padding: "0 40px"
                                    }}
                                >
                                    <p>Switch Branches</p>
                                </div>
                                <hr />
                                <div className="search-branch">
                                    <input
                                    autoFocus={true}
                                    type="text"
                                    placeholder="Search branches or tags"
                                    />
                                    <div className="branches">
                                    <ul>
                                        <li className="branch-header">Branches</li>
                                        {this.Branches.map((branch, index) => (
                                        <li key={index}>
                                            <p>{branch}</p>
                                        </li>
                                        ))}
                                    </ul>
                                    </div>
                                </div>
                                </div>
                            )}
                            </div>     
                            <Input placeholder="Search a file"/>
                        </div>   
                        <div id="right-div">
                            <button className="light-green-button">Accept</button>
                            <button className="white-button round-border-black-color"> <p> Diselect all </p></button>
                            <button className="white-button round-border-black-color"> <p> Select all </p></button>
                        </div>
                    </div>
                    <br />
                    <div id="table-container">
                        <table className="file-properties" id="file-tree">
                            <thead>
                                <tr className="title-row">
                                    <th style={{width: '6%'}}>
                                        
                                    </th>
                                    <th style={{width: '5%'}}>
                                        <p id="paragraphName">Name</p>
                                    </th>
                                    <th style={{width: '87%'}}>
                                        <p> { this.props.files.length } files selected</p>
                                    </th>
                                </tr>
                            </thead>

                         <tbody>
                            {this.props.files.map((file, index) => {
                            return (
                                <tr key={index} className="files-row" style={{justifyContent: 'unset'}}>
                                    
                                    <td className="file-type" style={{width: 'unset'}}>
                                        <label className="customized-checkbox" >
                                            <input type="checkbox"> 
                                            </input>
                                            <span className="checkmark"></span> 
                                        </label>
                                    </td>
                                    <td className="file-type" style={{width: 'unset'}}>
                                        <p>
                                        <img src={ file.type === "tree" ? folderIcon: fileIcon } alt="" />
                                        </p>
                                        <p>
                                        {file.name}
                                        </p>
                                    </td>
                                </tr>
                            )})
                        }
                        </tbody> 
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

SelectDataPipelineModal.propTypes = {
    show: PropTypes.bool
}

function mapStateToProps(state) {
    return {
      files: state.files,
      project: state.project,
      file: state.file
    };
  }
  
  function mapDispatchToProps(dispatch) {
    return {
      actions: bindActionCreators(fileActions, dispatch)
    };
  }
  
  export default connect(
    mapStateToProps,
    mapDispatchToProps
  )(SelectDataPipelineModal);
  