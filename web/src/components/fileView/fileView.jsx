import React from 'react';
import './fileView.css';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { Base64 } from 'js-base64';
import { Link } from 'react-router-dom';
import { string, shape, arrayOf } from 'prop-types';
import MDropdown from 'components/ui/MDropdown';
import ProjectContainer from '../projectContainer';
import CommitsApi from '../../apis/CommitsApi';
import Navbar from '../navbar/navbar';
import file01 from '../../images/file_01.svg';
import filesApi from '../../apis/FilesApi';
import DeleteFileModal from '../delete-file-modal/deleteFileModal';

export class FileView extends React.Component {
  constructor(props) {
    super(props);
    const { projects } = this.props;
    this.state = {
      project: projects && projects.selectedProject,
      commitInfo: {},
      fileData: null,
      isdeleteModalVisible: false,
    };

    this.showDeleteModal = this.showDeleteModal.bind(this);
  }

  componentDidMount() {
    const { match: { params: { projectId, file, branch } } } = this.props;
    filesApi.getFileData(
      projectId,
      file,
      branch,
    ).then((res) => {
      const fileData = res;
      this.setState({ fileData });
      this.getCommit(projectId, fileData.last_commit_id);
    })
      .catch((err) => toastr.error('Error: ', err.message));
  }

  componentWillUnmount() {
    this.setState = (state) => (state);
  }

  getCommit = (projectId, lastCommitId) => CommitsApi
    .getCommitDetails(projectId, lastCommitId)
    .then((commitInfo) => this.setState({ commitInfo }))
    .catch((err) => toastr.error('Error: ', err.message));

  showDeleteModal = () => this.setState((prevState) => (
    { isdeleteModalVisible: !prevState.isdeleteModalVisible }
  ));

  render() {
    const { users, branches, match: { params: { file, branch, projectId } } } = this.props;
    const {
      project,
      commitInfo : {
        author_name: authorName,
        message,
        short_id: commiterShortId,
      },
      fileData,
      isdeleteModalVisible,
    } = this.state;
    const groupName = project.namespace.name;
    let fileName = null;
    let fileSize = null;
    let avatar = 'https://assets.gitlab-static.net/uploads/-/system/user/avatar/3839940/avatar.png';
    let fileContent = [];
    let filepath = [];
    let extension;
    if (users && authorName) {
      users.forEach((contributor) => {
        const { name } = contributor;
        const avatarUrl = contributor.avatar_url;
        if (name === authorName) {
          avatar = avatarUrl;
        }
      });

    }

    if (fileData) {
      fileName = fileData.file_name;
      fileSize = fileData.size;
      fileContent = Base64.decode(fileData.content).split('\n');
      extension = fileName.split('.').pop().toLowerCase();
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
          activeFeature="data"
          folders={[groupName, project && project.name, 'Data']}
        />
        <div className="branch-path">
          <MDropdown
            label={decodeURIComponent(branch)}
            component={(
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
          />

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
                <img src={avatar} alt={authorName} />
              </div>
              <div className="commit-msg">
                <p>{message}</p>
                <span>
                  by
                  {' '}
                  <b>{authorName}</b>
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
              <span>{commiterShortId}</span>
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
              <div className="file-actions pr-2">
                <Link
                  to={`/my-projects/${projectId}/${branch}/commits/${file}`}
                  className="btn btn-sm btn-basic-dark my-auto ml-2"
                >
                  History
                </Link>
                <button
                  type="button"
                  className="btn btn-sm btn-basic-dark my-auto ml-2"
                >
                  Replace
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-danger my-auto ml-2"
                  onClick={this.showDeleteModal}
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
