import React from 'react';
import './fileView.css';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { Base64 } from 'js-base64';
import { Link } from 'react-router-dom';
import { string, shape, arrayOf } from 'prop-types';
import ProjectContainer from '../projectContainer';
import CommitsApi from '../../apis/CommitsApi';
import Navbar from '../navbar/navbar';
import file01 from '../../images/file_01.svg';
import arrowBlue from '../../images/arrow_down_blue_01.svg';
import filesApi from '../../apis/FilesApi';
import DeleteFileModal from '../delete-file-modal/deleteFileModal';

export class FileView extends React.Component {
  constructor(props) {
    super(props);
    const { projects } = this.props;
    const { match: { params: { projectId, file, branch } } } = this.props;
    this.state = {
      isOpen: false,
      project: projects && projects.selectedProject,
      committer: [],
      fileData: null,
      isdeleteModalVisible: false,
    };

    this.handleBranch = this.handleBranch.bind(this);
    this.showDeleteModal = this.showDeleteModal.bind(this);

    filesApi.getFileData(
      projectId,
      file,
      branch,
    ).then((res) => this.setState({ fileData: res }))
      .catch((err) => toastr.error('Error: ', err.message));
  }

  componentWillUnmount() {
    this.setState = (state) => (state);
  }

  getCommit() {
    const propSet = this.props;
    const { projectId } = propSet.match.params;
    const { fileData } = this.state;
    CommitsApi.getCommitDetails(projectId, fileData.last_commit_id)
      .then((result) => this.setState({ committer: result }))
      .catch((err) => toastr.error('Error: ', err.message));
  }

  handleOutsideClick = () => {
    this.handleBranch();
  }

  handleBranch() {
    const { isOpen } = this.state;
    if (!isOpen) {
      document.addEventListener('click', this.handleOutsideClick, false);
    } else {
      document.removeEventListener('click', this.handleOutsideClick, false);
    }

    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  }

  showDeleteModal = () => this.setState((prevState) => (
    { isdeleteModalVisible: !prevState.isdeleteModalVisible }
  ));

  render() {
    const { users, branches, match: { params: { file, branch, projectId } } } = this.props;
    const {
      project,
      committer,
      fileData,
      isdeleteModalVisible,
    } = this.state;
    const { isOpen } = this.state;
    let fileName = null;
    let fileSize = null;
    let avatar = 'https://assets.gitlab-static.net/uploads/-/system/user/avatar/3839940/avatar.png';
    let fileContent = [];
    let filepath = [];
    let extension;

    if (users) {
      users.forEach((contributor) => {
        const { name } = contributor;
        const avatarUrl = contributor.avatar_url;
        if (name === committer.author_name) {
          avatar = avatarUrl;
        }
      });
    }

    if (fileData) {
      this.getCommit();
      fileName = fileData.file_name;
      fileSize = fileData.size;
      fileContent = Base64.decode(fileData.content).split('\n');
      extension = fileName.split('.').pop();
      filepath = fileData.file_path.split('/');
    }

    return (
      <div>
        <DeleteFileModal
          projectId={projectId}
          filepath={file}
          isModalVisible={isdeleteModalVisible}
          fileName={fileName}
          branches={branches.map((branchObj) => branchObj.name)}
          showDeleteModal={this.showDeleteModal}
          branchSelected={branch}
        />
        <Navbar />
        <ProjectContainer
          project={project}
          activeFeature="data"
          folders={['Group Name', project && project.name, 'Data']}
        />
        <div className="branch-path">
          <div className="branch-btn" ref={this.branchRef}>
            <button type="button" onClick={this.handleBranch}>
              <span>{decodeURIComponent(branch)}</span>
              <img className="dropdown-white" src={arrowBlue} alt="" />
            </button>
          </div>
          {isOpen && (
            <div id="branches-list" className="select-branch fileview-select">
              <div
                style={{ margin: '0 50px', fontSize: '14px', padding: '0 40px' }}
              >
                <p>Switch Branches</p>
              </div>
              <hr />
              <div className="search-branch">
                <input
                  type="text"
                  placeholder="Search branches or tags"
                />
                <div className="branches">
                  <ul>
                    <li className="branch-header">Branches</li>
                    {branches && branches.filter((branch) => !branch.name.startsWith('data-pipeline/')
                      && !branch.name.startsWith('experiment/')).map((branch) => {
                      const encoded = encodeURIComponent(branch.name);
                      return (
                        <li key={encoded}>
                          <Link
                            id={branch.name}
                            to={`/my-projects/${project.id}/${encoded}`}
                            onClick={this.handleClick}
                          >
                            <p>{branch.name}</p>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          )}
          <span className="filepath">
            <b>
              <a href="/home">{project && project.name}</a>
              {' '}
              /
              {filepath.map((path, i) => (filepath.length === i + 1 ? (
                <span key={path}>{path}</span>
              ) : (
                <span key={i.toString()}>
                  <a href="/">
                    {path}
                    {' '}
                  </a>
                  /
                </span>
              )))}
            </b>
          </span>
        </div>
        <div className="commit-container">
          <div className="file-container-header">
            <div className="commit-info">
              <div className="commit-pic-circle">
                <img src={avatar} alt={committer.author_name} />
              </div>
              <div className="commit-msg">
                <p>{committer.message}</p>
                <span>
                  by
                  {' '}
                  <b>{committer.author_name}</b>
                  {' '}
                  authored
                  {' '}
                  <b>4</b>
                  {' '}
                  days ago
                </span>
              </div>
            </div>
            <div className="commit-code">
              <span>{committer.short_id}</span>
              <img className="file-icon" src={file01} alt="" />
            </div>
          </div>
          <div className="contributors">
            <p>
              <b>3 Contributors</b>
            </p>
            <div className="contributor-list">
              <div className="commit-pic-circle" />
              <div className="commit-pic-circle" />
              <div className="commit-pic-circle" />
            </div>
          </div>
        </div>

        <div className="file-container">
          <div className="file-container-header">
            <div className="file-info">
              <p>
                {fileName}
                {' '}
                |
                {fileSize}
                {' '}
                Bytes
              </p>
            </div>
            <div className="wrapper">
              <div className="file-actions">
                <button type="button" className="white-button">
                  <Link to={`/my-projects/${projectId}/${branch}/commits/${file}`}>History</Link>
                </button>
                <button type="button" className="white-button">Replace</button>
                <button
                  type="button"
                  className="red-button"
                  onClick={this.showDeleteModal}
                  style={{ cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
          <div
            itemProp="text"
            className="Box-body p-0 blob-wrapper data type-text"
          >
            <div className="file-content">
              {extension === 'jpg' || extension === 'png' ? (
                <div>
                  <img
                    className="file-img"
                    src={`data:image/png;base64,${fileData.content}`}
                    alt={fileName}
                  />
                </div>
              ) : (
                <table>
                  <tbody>
                    {fileContent.map((line, i) => (
                      <tr key={i.toString()}>
                        <td>
                          <p>{line}</p>
                        </td>
                      </tr>
                    ))}
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

FileView.defaultProps = {
  match: {
    params: {},
  },
};

FileView.propTypes = {
  match: shape({
    params: shape({
      projectId: string.isRequired,
      file: string.isRequired,
      branch: string.isRequired,
    }),
  }),
  users: arrayOf(shape({
    name: string.isRequired,
    avatar_url: string.isRequired,
  })).isRequired,
  branches: arrayOf(
    shape({
      name: string.isRequired,
    }).isRequired,
  ).isRequired,
  projects: shape({
    selectedProject: shape({

    }),
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    projects: state.projects,
    branches: state.branches,
    users: state.users,
  };
}

export default connect(
  mapStateToProps,
)(FileView);
