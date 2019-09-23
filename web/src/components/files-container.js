import React, { Component } from "react";
import folderIcon from "./../images/folder_01.svg";
import fileIcon from "./../images/file_01.svg";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as fileActions from "./../actions/fileActions";

class FilesContainer extends Component {
  constructor(props) {
    super(props);
    this.clickListener = this.clickListener.bind(this);
    this.getBack = this.getBack.bind(this);

    this.state = {
      currentPath: "",
      fileSize: ""
    }

    window.onpopstate = () => {
      var path = this.getParamFromUrl("path", window.location.href);
      this.props.actions.loadFiles(path, this.props.branch, this.props.projectId);

    };
  }

  componentWillUpdate() {
    const projectId = window.location.href.split("/my-projects/")[1].split("/")[0];
    const urlPath = this.getParamFromUrl("path", window.location.href);

    if (urlPath !== this.state.currentPath) {
      this.setState({ currentPath: urlPath });
      this.props.actions.loadFiles(
        urlPath,
        this.props.branch,
        projectId
      );
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

  getParamFromUrl(param, url) {
    return new URL(url).searchParams.get(param);
  }

  getBack() {
    window.history.back();
  }

  clickListener(e) {
    this.props.actions.loadFiles(
      this.getParamFromUrl(
        "path", 
        e.target.nodeName === "IMG" 
          ? e.target.parentNode.href
          : e.target.href
      ),
      this.props.branch
    );
  }

  renderFiles() {
    const branch = this.props.branch;
    const fileElements = [];
    const projectId = this.props.projectId;
    this.props.files.forEach((file, index) => {
      let icon;
      let link;
      var url_string = window.location.href;
      var url = new URL(url_string);
      var path = url.searchParams.get("path");

      if (file.type === "tree") {
        icon = folderIcon;
        link = path
          ? `/my-projects/${projectId}/files/branch/${branch}?path=${path}/${file.name}`
          : `/my-projects/${projectId}/files/branch/${branch}?path=${file.name}`;
      } else {
        icon = fileIcon;
        path = path ? path : "";
        link = `/my-projects/${projectId}/files/branch/${branch}/file-name/${file.name}?path=${path}`;
      }

      fileElements.push(
        <tr key={index} className="files-row">
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
            <p>48Kb</p>{" "}
          </td>
          <td>
            {" "}
            <p> yesterday </p>{" "}
          </td>
        </tr>
      );
    });

    return fileElements;
  }

  render() {
    return (
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
            {this.renderFiles()}
          </tbody>
        </table>
      </div>
    );
  }
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
)(FilesContainer);
