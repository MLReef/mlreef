import React from "react";
import ProjectContainer from './projectContainer';
import "../css/file-view.css";
import {connect} from 'react-redux';
import * as fileActions from '../actions/fileActions';
import {bindActionCreators} from "redux";
import {Base64} from 'js-base64';
import Navbar from './navbar';

class FileView extends React.Component{
    componentDidMount(){
        var url_string = window.location.href;
        var url = new URL(url_string);
        var path = url.searchParams.get("path");
        
        if(path){
            path = path.replace(/\//g, '%2F');
            path = path + "%2F" + this.props.match.params.file
        } else {
            path = this.props.match.params.file;
        }

        this.props.actions.getFileData(path, this.props.match.params.branch);
    }

    render(){
        const fileName = this.props.fileData.file_name;
        const fileSize = this.props.fileData.size;
        let fileContent = [];
        let foo;
        if(this.props.fileData.content){
            fileContent = Base64.decode(this.props.fileData.content).split("\n");
            foo = this.props.fileData.content;
        }
    
        return (
            <div>
                <Navbar/>
                <ProjectContainer/>
                <div className="file-container">
                    <div className="file-container-header">
                        <p>{fileName} | {fileSize} Bytes</p>
                    </div>
                    <div className="file-content">
                        <table>
                            <tbody>
                                {fileContent.map(function(line) {
                                    console.log("foo.size:" + foo.size + "; foo.length:" + foo.length);

                                    return (
                                        <tr>
                                            <td>
                                                <p>{line}</p>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state){
    return {
        fileData: state.file,
        project: state.project
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(fileActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FileView);
