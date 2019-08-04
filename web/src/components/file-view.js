import React from "react";
import ProjectContainer from "./projectContainer";
import "../css/file-view.css";
import { connect } from "react-redux";
import * as fileActions from "../actions/fileActions";
import { bindActionCreators } from "redux";
import { Base64 } from "js-base64";
import Navbar from "./navbar";

class FileView extends React.Component {
  componentDidMount() {
    var url_string = window.location.href;
    var url = new URL(url_string);
    var path = url.searchParams.get("path");

    if (path) {
      path = path.replace(/\//g, "%2F");
      path = path + "%2F" + this.props.match.params.file;
    } else {
      path = this.props.match.params.file;
    }

    this.props.actions.getFileData(path, this.props.match.params.branch);
  }

  render() {
    const fileName = this.props.fileData.file_name;
    const fileSize = this.props.fileData.size;
    let fileContent = [];
    let foo;
    let extension;
    if (this.props.fileData.content) {
      fileContent = Base64.decode(this.props.fileData.content).split("\n");
      extension = fileName.split(".").pop();
      foo = this.props.fileData.content;
    }

    return (
      <div>
        <Navbar />
        <ProjectContainer />
        <div className="file-container">
          <div className="file-container-header">
            <div className="file-info">
              <p>
                {fileName} | {fileSize} Bytes
              </p>
            </div>
            <div className="wrapper">
              <div className="file-actions">
                <button className="white-button">History</button>
                <button className="white-button">Replace</button>
                <button className="red-button">Delete</button>
              </div>
            </div>
          </div>
          <div
            itemProp="text"
            className="Box-body p-0 blob-wrapper data type-text"
          >
            <div className="file-content">
              {extension === ("png" || "jpg" || "jpeg") ? (
                <img
                  src={`data:image/png;base64,${this.props.fileData.content}`}
                  alt={fileName}
                />
              ) : (
                <table>
                  <tbody>
                    {fileContent.map(function(line) {
                      return (
                        <tr>
                          <td>
                            <p>{line}</p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FileView);
