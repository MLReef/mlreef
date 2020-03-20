import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import {
  string, number, shape, func,
} from 'prop-types';
import FilesTable from '../files-table/filesTable';
import filesApi from '../../apis/FilesApi';
import BranchesApi from '../../apis/BranchesApi';
import './FilesContainer.css';
import AuthWrapper from 'components/AuthWrapper';

class FilesContainer extends Component {
  constructor(props) {
    super(props);
    this.getBack = this.getBack.bind(this);
    const { files } = this.props;
    this.state = {
      projectId: null,
      currentPath: '',
      currentBranch: '',
      files: files || [],
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
    if (prevProps.projectId !== undefined && prevProps.projectId !== projectId) {
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
          this.setState({ redirect: true });
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
    const { projectId, branch, history } = this.props;
    return (
      <>
        {redirect
          ? <Redirect to="/error-page" />
          : null}
        {files.length > 0 ? (
          <div className={`files-container ${branch === 'master' ? 'files-container-master' : ''}`}>
            {branch !== 'master' && (
            <div className="commit-status px-3 py-2">
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
              <AuthWrapper role={3}>
                <Link
                  type="button"
                  className="btn btn-basic-dark"
                  to={`/my-projects/${projectId}/${currentBranch}/new-merge-request`}
                >
                Create merge request
              </Link>
              </AuthWrapper>
            </div>
            )}
            <FilesTable
              files={files.map((f) => ({ id: f.id, name: f.name, type: f.type }))}
              headers={['Name']}
              onClick={(e) => {
                const target = e.currentTarget;
                const targetDataKey = target.getAttribute('data-key');
                const targetId = target.id;
                const file = files.filter((f) => f.id === targetId)[0];
                let routeType;
                if (targetDataKey === 'tree') {
                  routeType = 'path';
                } else {
                  routeType = 'blob';
                }
                const link = `/my-projects/${projectId}/${branch}/${routeType}/${encodeURIComponent(file.path)}`;
                history.push(link);
              }}
            />
          </div>
        ) : null }
      </>
    );
  }
}

FilesContainer.propTypes = {
  projectId: number.isRequired,
  branch: string.isRequired,
  path: string,
  history: shape({ push: func }).isRequired,
};

FilesContainer.defaultProps = {
  path: '',
};

export default FilesContainer;
