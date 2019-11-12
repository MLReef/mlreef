import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import folderIcon from '../images/folder_01.svg';
import fileIcon from '../images/file_01.svg';
import {
  generateNewArrayOfFilesToRender,
  getFilesInFolder,
  findFolderContainer,
}
  from '../functions/dataParserHelpers';
import { callToGetFilesInFolder } from '../functions/apiCalls';

class FilesContainer extends Component {
  constructor(props) {
    super(props);
    this.getBack = this.getBack.bind(this);

    this.state = {
      currentPath: '',
      currentBranch: '',
      fileSize: '',
      files: [],
      redirect: false,
    };

    window.onpopstate = () => {
      this.props.setModalVisibility(true);
      this.updateFilesArray();
    };
  }

  updateFilesArray = async () => {
    this.props.setModalVisibility(true);
    const res = await Promise.all([
      callToGetFilesInFolder(
        this.props.path,
        this.props.branch,
        this.props.projectId,
        true,
      ),
    ]);
    if (res[0].message) {
      return false;
    }
    const updatedFiles = await generateNewArrayOfFilesToRender(res[0], this.props.projectId, this.props.branch);
    const filteredFiles = updatedFiles.filter((file) => findFolderContainer(file, updatedFiles).length === 0);
    filteredFiles.forEach((file) => {
      if (file.type === 'tree') {
        file.count = getFilesInFolder(file, updatedFiles).length;
      }
    });

    return filteredFiles;
  }

  componentDidUpdate = async () => {
    const urlPath = this.props.path
      ? decodeURIComponent(this.props.path)
      : null;
    if (
      this.props.branch !== this.state.currentBranch
          || urlPath !== this.state.currentPath
    ) {
      const files = await this.updateFilesArray();
      if (!files) {
        this.setState({ redirect: true });
        return;
      }
      this.setState({
        currentPath: urlPath,
        currentBranch: this.props.branch,
        files,
      });
      this.props.setModalVisibility(false);
    }
  }

  getReturnOption() {
    if (window.location.href.includes('path')) {
      return (
        <tr className="files-row">
          <td className="file-type">
            <button onClick={this.getBack} style={{ padding: '0' }}>
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

  render = () => (
    <>
      {this.state.redirect
        ? <Redirect to="/error-page" />
        : null}
      <div className="files-container">
        <div className="commit-status">
          <p id="commitStatus">
            This branch is
            {' '}
            <b>123 commits</b>
            {' '}
ahead and
            {' '}
            <b>1 commit</b>
            {' '}
behind
            {' '}
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
              let icon;
              let routeType = '';
              if (file.type === 'tree') {
                routeType = 'path';
                icon = folderIcon;
              } else {
                routeType = 'blob';
                icon = fileIcon;
              }
              const link = `/my-projects/${this.props.projectId}/${this.props.branch}/${routeType}/${encodeURIComponent(file.path)}`;

              return (
                <tr key={index} className="files-row">
                  <td className="file-type">
                    <Link to={link}>
                      <img src={icon} alt="" />
                    </Link>
                    <Link to={link}>
                      {file.name}
                    </Link>
                  </td>
                  <td>
                    {' '}
                    <p>Something</p>
                  </td>
                  <td>
                    <p>
                      {file.size}
KB
                      {' '}
                      {file.count && `(${file.count})`}
                    </p>
                  </td>
                  <td>
                    {' '}
                    <p> yesterday </p>
                    {' '}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

function mapStateToProps(state) {
  return {
    files: state.files,
  };
}

export default connect(
  mapStateToProps,
)(FilesContainer);
