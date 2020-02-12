import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { string, number } from 'prop-types';
import folderIcon from 'images/folder_01.svg';
import fileIcon from 'images/file_01.svg';
import filesApi from 'apis/FilesApi';
import BranchesApi from 'apis/BranchesApi';
import './FilesContainer.css';

class FilesContainer extends Component {
  constructor(props) {
    super(props);
    this.getBack = this.getBack.bind(this);
    this.state = {
      projectId: null,
      currentPath: '',
      currentBranch: '',
      files: [],
      behind: [],
      ahead: [],
      redirect: false,
    };
  }

  componentDidUpdate(prevProps) {
    const {
      path,
      branch,
    } = this.props;
    const {
      projectId,
      currentBranch,
      currentPath,
    } = this.state;
    const urlPath = path
      ? decodeURIComponent(path)
      : null;
    if(prevProps.projectId !== undefined && prevProps.projectId !== projectId){
      this.updateFilesArray();
      this.setState({ projectId: prevProps.projectId });
    }
    if (
      branch !== currentBranch
        || urlPath !== currentPath
    ) {
      try {
        this.updateFilesArray();
        if (branch !== 'master') this.getBranchInfo();
      } catch (error) {
        return error;
      }
      this.setState({
        currentPath: urlPath,
        currentBranch: branch,
      });
    }
  }

  componentWillUnmount() {
    this.setState = (state) => (state);
  }

  getReturnOption = () => (
    window.location.href.includes('path') ? (
      <tr className="files-row">
        <td className="file-type">
          <button
            type="button"
            onClick={this.getBack}
            style={{ padding: '0' }}
          >
            <img src={folderIcon} alt="" />
          </button>
          <button
            type="button"
            onClick={this.getBack}
          >
            ..
          </button>
        </td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      </tr>
    )
      : null);

  updateFilesArray = () => {
    const {
      projectId,
      path,
      branch,
    } = this.props;
    filesApi.getFilesPerProject(
      projectId,
      path || '',
      false,
      branch,
    ).then((res) => {
      this.setState({ files: res });
    })
      .catch(
        () => {
          this.setState({ redirect: true })
        },
      );
  }

  getBack = () => window.history.back();

  getBranchInfo = () => {
    const { projectId, branch } = this.props;
    BranchesApi.compare(projectId, branch, 'master')
      .then((res) => this.setState({ behind: res.commits.length })).catch((err) => err);
    BranchesApi.compare(projectId, 'master', branch)
      .then((res) => this.setState({ ahead: res.commits.length })).catch((err) => err);
  }

  render = () => {
    const {
      redirect,
      files,
      ahead,
      behind,
      currentBranch,
    } = this.state;
    const { projectId, branch } = this.props;
    return (
      <>
        {redirect
          ? <Redirect to="/error-page" />
          : null}
        {files.length > 0 ? <div className={`files-container ${branch === 'master' ? 'files-container-master' : ''}`}>
          {branch !== 'master' && (
          <div className="commit-status">
            <p id="commitStatus">
              This branch is
              {' '}
              <b>
                {ahead}
                {' '}
commit(s)
              </b>
              {' '}
              ahead and
              {' '}
              <b>
                {behind}
                {' '}
commit(s)
              </b>
              {' '}
              behind
              {' '}
              <b>&quot;master&quot;.</b>
            </p>
            <Link
              type="button"
              className="create-mr"
              to={`/my-projects/${projectId}/${currentBranch}/new-merge-request`}
            >
              <p>
                Create merge request
              </p>
            </Link>
          </div>
          )}

            <table className="file-properties" id="file-tree">
            <thead>
              <tr className="title-row">
                <th>
                  <p id="paragraphName">Name</p>
                </th>
              </tr>
            </thead>

            <tbody>
              {this.getReturnOption()}
              {files.map((file) => {
                let icon;
                let routeType = '';
                if (file.type === 'tree') {
                  routeType = 'path';
                  icon = folderIcon;
                } else {
                  routeType = 'blob';
                  icon = fileIcon;
                }
                const link = `/my-projects/${projectId}/${branch}/${routeType}/${encodeURIComponent(file.path)}`;
                return (
                  <tr key={`${file.id} ${file.name}`} className="files-row">
                    <td className="file-type">
                      <Link to={link}>
                        <img src={icon} alt="" />
                      </Link>
                      <Link to={link} title={file.name} className="file-name-link">
                        {file.name}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody> 
          </table>
        </div> : null }
      </>
    );
  }
}

FilesContainer.propTypes = {
  projectId: number.isRequired,
  branch: string.isRequired,
  path: string,
};

FilesContainer.defaultProps = {
  path: '',
};

export default FilesContainer;
