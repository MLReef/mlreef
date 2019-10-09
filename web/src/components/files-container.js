import React, { Component } from "react";
import folderIcon from "./../images/folder_01.svg";
import fileIcon from "./../images/file_01.svg";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { 
  generateNewArrayOfFilesToRender,
  getParamFromUrl,
  getFilesInFolder,
  findFolderContainer
}
from "./../functions/dataParserHelpers";
import { callToGetFilesInFolder } from './../functions/apiCalls';

class FilesContainer extends Component {
  constructor(props) {
    super(props);
    this.clickListener = this.clickListener.bind(this);
    this.getBack = this.getBack.bind(this);

    this.state = {
      currentPath: "",
      currentBranch: "",
      fileSize: "",
      files: []
    }

    window.onpopstate = () => {
      this.updateState();
    };
  }

  updateState = async () => {
    var path = getParamFromUrl("path", window.location.href);
    const res = await Promise.all([callToGetFilesInFolder(path, this.props.branch, this.props.projectId, true)])
    const updatedFiles = await generateNewArrayOfFilesToRender(res[0], this.props.projectId, this.props.branch);
    this.setState({files: updatedFiles})
  }
    
  componentDidUpdate() {
    const urlPath = getParamFromUrl("path", window.location.href);

    if(this.props.branch !== this.state.currentBranch){
      this.setState({ currentBranch: this.props.branch });
      this.updateState();
    }
    if (urlPath !== this.state.currentPath) {
      this.setState({ currentPath: urlPath });
      this.updateState();
    }
  }

  getReturnOption() {
    if (window.location.href.includes("path")) {
      return (
        <tr className="files-row">
          <td className="file-type">
            <button onClick={this.getBack} style={{ padding: "0" }}>
              <img src={folderIcon} alt="" />
            </button>

            <button onClick={this.getBack}>..</button>
          </td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
        </tr>
      );
    }
  }

  
  getBack = () => window.history.back()
  
  clickListener(e) {
    this.updateState()
  }

  render = () =>
      <div className="files-container">
        <div className="commit-status">
          <p id="commitStatus">
            This branch is <b>123 commits</b> ahead and <b>1 commit</b> behind{" "}
            <b>"master".</b>
          </p>
          <button className="create-pr">
            <p>Create Pull Request</p>
          </button>
        </div>

        <table className="file-properties" id="file-tree">
          <thead>
            <tr className="title-row">
              <th>
                <p id="paragraphName">Name</p>
              </th>
              <th>
                <p id="paragraphLastCommit">Last Commit</p>
              </th>
              <th>
                <p id="paragraphSize">Size(files)</p>
              </th>
              <th>
                <p id="paragraphLastUpdate">Last Update</p>
              </th>
            </tr>
          </thead>

          <tbody>
            {this.getReturnOption()}
            {this.state.files.map((file, index) => {
              if(findFolderContainer(file, this.state.files).length > 0){
                return null;
              }

              let icon;
              let link;
              var url_string = window.location.href;
              var url = new URL(url_string);
              var path = url.searchParams.get("path");
              let filesInFolder = null;

              if (file.type === "tree") {
                filesInFolder = getFilesInFolder(file, this.state.files);
                icon = folderIcon;
                const basePath = `/my-projects/${this.props.projectId}/files/branch/${this.props.branch}?path=`
                link = path
                  ? `${basePath}${path}/${file.name}`
                  : `${basePath}${file.name}`;
              } else {
                icon = fileIcon;
                path = path ? path : "";
                link = `/my-projects/${this.props.projectId}/files/branch/${this.props.branch}/file-name/${file.name}?path=${path}`;
              }

              return <tr key={index} className="files-row">
                  <td className="file-type">
                    <Link onClick={this.clickListener} to={link}>
                      <img src={icon} alt="" />
                    </Link>
                    <Link onClick={this.clickListener} to={link}>
                      {file.name}
                    </Link>
                  </td>
                  <td>
                    {" "}
                    <p>Something</p>
                  </td>
                  <td>
                    <p>{file.size}KB {filesInFolder && `(${filesInFolder.length})`}</p>
                  </td>
                  <td>
                    {" "}
                    <p> yesterday </p>{" "}
                  </td>
                </tr>
            })}
          </tbody>
        </table>
      </div>
}

function mapStateToProps(state) {
  return {
    files: state.files
  };
}

export default connect(
  mapStateToProps
)(FilesContainer);
