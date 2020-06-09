import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import AuthWrapper from 'components/AuthWrapper';
import {
  string, number, shape, func,
} from 'prop-types';
import { toastr } from 'react-redux-toastr';
import FilesTable from '../files-table/filesTable';
import filesApi from '../../apis/FilesApi';
import BranchesApi from '../../apis/BranchesApi.ts';
import './FilesContainer.css';

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
    };
  }

  componentDidMount() {
    this.updateFilesArray();
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
      this.setState({
        currentPath: urlPath,
        currentBranch: branch,
      });
      try {
        this.updateFilesArray();
        if (branch !== 'master') this.getBranchInfo();
      } catch (error) {
        return error;
      }
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
    ).then(async (res) => {
      if (res.ok) {
        const files = await res.json();
        this.setState({ files });
      } else {
        toastr.error('Error', 'Something went wrong getting files');
      }
    });
  }

  getBack = () => window.history.back();

  getBranchInfo = () => {
    const { projectId, branch } = this.props;
    const brApi = new BranchesApi();
    brApi.compare(projectId, branch, 'master')
      .then((res) => this.setState({ behind: res.commits.length })).catch((err) => err);
    brApi.compare(projectId, 'master', branch)
      .then((res) => this.setState({ ahead: res.commits.length })).catch((err) => err);
  }

  render = () => {
    const {
      files,
      ahead,
      behind,
      currentBranch,
      currentPath,
    } = this.state;
    const { projectId, branch, history } = this.props;
    return (
      <div className={`files-container ${branch === 'master' ? 'files-container-master' : ''}`}>
        {currentBranch !== 'master' && (
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
          <AuthWrapper minRole={30}>
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
          isReturnOptVisible={currentPath}
          files={files.map((f) => ({ id: `${f.id} ${f.name}`, name: f.name, type: f.type }))}
          headers={['Name']}
          onClick={(e) => {
            const target = e.currentTarget;
            const targetDataKey = target.getAttribute('data-key');
            const targetId = target.id;
            const file = files.filter((f) => `${f.id} ${f.name}` === targetId)[0];
            if(!file){
              toastr.error('Error', 'Something wrong browsing app');
              return;
            }
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
