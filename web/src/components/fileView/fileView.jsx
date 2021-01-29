import React from 'react';
import MCodeRenderer from 'components/layout/MCodefileRenderer/MCodefileRenderer';
import './fileView.css';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { toastr } from 'react-redux-toastr';
import { Base64 } from 'js-base64';
import { Link } from 'react-router-dom';
import {
  string, shape, arrayOf, func, number,
} from 'prop-types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import AuthWrapper from 'components/AuthWrapper';
import MDropdown from 'components/ui/MDropdown';
import MWrapper from 'components/ui/MWrapper';
import { generateBreadCrumbs } from 'functions/helpers';
import { getProjectDetailsBySlug } from 'store/actions/projectInfoActions';
import ProjectContainer from '../projectContainer';
import CommitsApi from '../../apis/CommitsApi.ts';
import Navbar from '../navbar/navbar';
import FilesApi from '../../apis/FilesApi.ts';
import DeleteFileModal from '../DeleteFileModal/DeleteFileModal';

dayjs.extend(relativeTime);

const file01 = '/images/svg/file_01.svg';

const filesApi = new FilesApi();
const commitsApi = new CommitsApi();

export class FileView extends React.Component {
  constructor(props) {
    super(props);
    const { projects } = this.props;
    this.state = {
      project: projects && projects.selectedProject,
      commitInfo: {},
      fileData: null,
      isdeleteModalVisible: false,
      contributors: [],
    };

    this.showDeleteModal = this.showDeleteModal.bind(this);
  }

  async componentDidMount() {
    const {
      actions,
      projectId,
      match: {
        params: {
          file, branch, commit, namespace, slug,
        },
      },
    } = this.props;
    let gid;

    if (projectId) {
      gid = projectId;
    } else {
      try {
        const res = await actions.getProjectDetailsBySlug(namespace, slug);
        gid = res?.project?.gid;
      } catch (err) {
        toastr.error('Error', 'Fetching faile info failed');
      }
    }

    filesApi.getFileData(gid, file?.includes('/') ? encodeURIComponent(file) : file, branch || commit)
      .then((res) => {
        const fileData = res;
        this.setState({ fileData });
        this.getCommit(gid, fileData.last_commit_id);
      })
      .catch((err) => toastr.error('Error: ', err.message));

    filesApi.getContributors(gid)
      .then((contributors) => { this.setState({ contributors }); });
  }

  componentWillUnmount() {
    this.setState = (state) => (state);
  }

  getCommit = (projectId, lastCommitId) => commitsApi
    .getCommitDetails(projectId, lastCommitId)
    .then((commitInfo) => this.setState({ commitInfo }))
    .catch((err) => toastr.error('Error: ', err.message));

  showDeleteModal = () => this.setState((prevState) => (
    { isdeleteModalVisible: !prevState.isdeleteModalVisible }
  ));

  render() {
    const {
      users,
      branches,
      projectId,
      match: {
        params: {
          file, branch, namespace, slug,
        },
      },
    } = this.props;
    const {
      project,
      project: {
        name,
      },
      commitInfo: {
        author_name: authorName,
        message,
        short_id: commiterShortId,
        created_at: createdAt,
      },
      fileData,
      isdeleteModalVisible,
      contributors,
    } = this.state;

    const numContribs = contributors.length;

    let fileName = null;
    let fileSize = null;
    let avatar;
    let fileContent = null;
    let filepath = [];
    let extension;
    const filteredBranches = branches.filter((branch) => !branch.name.startsWith('data-pipeline/')
      && !branch.name.startsWith('experiment/'));
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
      fileContent = Base64.decode(fileData.content);
      extension = fileName.split('.').pop().toLowerCase();
      filepath = fileData.file_path.split('/');
    }

    const customCrumbs = [
      {
        name: 'Data',
        href: `/${namespace}/${slug}`,
      },
    ];

    return (
      <div className="file-view">
        {projectId && (
          <DeleteFileModal
            namespace={namespace}
            slug={slug}
            projectId={projectId}
            filepath={encodeURIComponent(file)}
            isModalVisible={isdeleteModalVisible}
            fileName={fileName}
            branches={branches.map((branchObj) => branchObj.name)}
            showDeleteModal={this.showDeleteModal}
            sourceBranch={branch}
          />
        )}
        <Navbar />
        {projectId && (
          <ProjectContainer
            activeFeature="data"
            breadcrumbs={generateBreadCrumbs(project, customCrumbs)}
          />
        )}
        <div className="branch-path">
          <MDropdown
            label={decodeURIComponent(branch || filteredBranches[0].name)}
            component={(
              <div id="branches-list" className="select-branch fileview-select">
                <div
                  style={{ margin: '0 50px', fontSize: '14px', padding: '0 40px' }}
                >
                  <p>Switch Branches</p>
                </div>
                <hr />
                <div className="search-branch">
                  <div className="branches">
                    <ul>
                      <li className="branch-header">Branches</li>
                      {filteredBranches.map((fBranch) => {
                        const encoded = encodeURIComponent(fBranch.name);
                        return (
                          <li key={encoded}>
                            <Link
                              id={fBranch.name}
                              to={`/${namespace}/${slug}/-/tree/${encoded}`}
                              onClick={this.handleClick}
                            >
                              <p>{fBranch.name}</p>
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
              <Link to={`/${namespace}/${slug}`}>
                {name}
              </Link>
              {' '}
              {filepath.slice(0, -1)
                .reduce((acc, namePath) => ({
                  cur: `${acc.cur}/${namePath}`,
                  list: acc.list.concat({
                    path: `${acc.cur}/${namePath}`,
                    namePath,
                  }),
                }), { cur: '', list: [] })
                .list.map(({ path, namePath }) => (
                  <Link key={path} to={`/${namespace}/${slug}/-/tree/${branch}${path}`}>
                    {`/ ${namePath} `}
                  </Link>
                ))}
              {filepath.slice(-1).map((path) => (
                <span key={`final-${path}`}>
                  {`/ ${path}`}
                </span>
              ))}
            </b>
          </span>
        </div>
        <div className="commit-container">
          <div className="file-container-header">
            <div className="commit-info">
              <div className="d-flex">
                {avatar && (
                  <Link to={`/${authorName}`} className="m-auto">
                    <img className="avatar-circle ml-3 mr-2" src={avatar} alt={authorName} />
                  </Link>
                )}
              </div>
              <div className="commit-msg">
                <div className="title">{message}</div>
                {!authorName?.match(/.+@.+/) && (
                  <span>
                    {'by '}
                    <Link to={`/${authorName}`}>
                      <b>
                        {authorName}
                      </b>
                    </Link>
                    {' authored '}
                    <b>{dayjs(createdAt).fromNow()}</b>
                  </span>
                )}
              </div>
            </div>
            <div className="commit-code">
              <span>{commiterShortId}</span>
              <img className="file-icon" src={file01} alt="" />
            </div>
          </div>
          <div className="contributors">
            <div>
              <b>{`${numContribs} contributor${numContribs !== 1 ? 's' : ''}`}</b>
            </div>
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
                  to={`/${namespace}/${slug}/-/commits/file/${branch}/-/${file}`}
                  className="btn btn-sm btn-basic-dark my-auto ml-2"
                >
                  History
                </Link>
                <MWrapper norender>
                  <button
                    type="button"
                    className="btn btn-sm btn-basic-dark my-auto ml-2"
                  >
                    Replace
                  </button>
                </MWrapper>
                <AuthWrapper minRole={30} norender>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger my-auto ml-2"
                    onClick={this.showDeleteModal}
                  >
                    Delete
                  </button>
                </AuthWrapper>
              </div>
            </div>
          </div>
          <div
            itemProp="text"
            className="Box-body p-0 blob-wrapper data type-text"
          >
            <div className="file-content">
              {extension === 'jpg' || extension === 'png' ? (
                <div className="d-flex">
                  <img
                    className="file-img mx-auto"
                    src={`data:image/png;base64,${fileData.content}`}
                    alt={fileName}
                  />
                </div>
              ) : (
                fileContent && (
                  <MCodeRenderer
                    code={fileContent}
                    fileExtension={extension}
                  />
                )
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
  projectId: number.isRequired,
  match: shape({
    params: shape({
      namespace: string.isRequired,
      slug: string.isRequired,
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
  actions: shape({
    getProjectDetailsBySlug: func.isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    projects: state.projects,
    projectId: state?.projects?.selectedProject?.gid,
    branches: state.branches,
    users: state.users,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      getProjectDetailsBySlug,
    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FileView);
