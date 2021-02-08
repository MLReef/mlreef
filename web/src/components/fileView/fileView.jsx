import React, { useEffect, useState } from 'react';
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
import hooks from 'customHooks/useSelectedProject';
import MLoadingSpinnerContainer from 'components/ui/MLoadingSpinner/MLoadingSpinnerContainer';
import ProjectContainer from '../projectContainer';
import CommitsApi from '../../apis/CommitsApi.ts';
import Navbar from '../navbar/navbar';
import FilesApi from '../../apis/FilesApi.ts';
import DeleteFileModal from '../DeleteFileModal/DeleteFileModal';

dayjs.extend(relativeTime);

const file01 = '/images/svg/file_01.svg';

const filesApi = new FilesApi();
const commitsApi = new CommitsApi();

const FileView = (props) => {
  const {
    users,
    branches,
    match: {
      params: {
        file, branch, commit, namespace, slug,
      },
    },
  } = props;

  const [selectedProject, isFetching] = hooks.useSelectedProject(namespace, slug);
  const { gid, name } = selectedProject;

  const [commitInfo, setCommitInfo] = useState({});
  const [fileData, setFileData] = useState(null);
  const [isDeleteModalVisible, setIsModalVisible] = useState(false);
  const [contributors, setContributors] = useState([]);

  const getCommit = (projectId, lastCommitId) => commitsApi
    .getCommitDetails(projectId, lastCommitId)
    .then(setCommitInfo)
    .catch((err) => toastr.error('Error: ', err.message));

  useEffect(() => {
    if (gid) {
      filesApi.getFileData(gid, file?.includes('/') ? encodeURIComponent(file) : file, branch || commit)
        .then((fData) => {
          setFileData(fData);
          getCommit(gid, fData.last_commit_id);
        })
        .catch((err) => toastr.error('Error: ', err.message));

      filesApi.getContributors(gid)
        .then(setContributors);
    }
  }, [selectedProject]);

  const showDeleteModal = () => setIsModalVisible(!isDeleteModalVisible);

  const {
    author_name: authorName,
    message,
    short_id: commiterShortId,
    created_at: createdAt,
  } = commitInfo;

  const numContribs = contributors.length;

  let fileName = null;
  let fileSize = null;
  let avatar;
  let fileContent = null;
  let filepath = [];
  let extension;
  let isImageFile = false;
  const filteredBranches = branches.filter((br) => !br.name.startsWith('data-pipeline/')
      && !br.name.startsWith('experiment/'));
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
    isImageFile = extension === 'jpg' || extension === 'png';
    filepath = fileData.file_path.split('/');
  }

  const customCrumbs = [
    {
      name: 'Data',
      href: `/${namespace}/${slug}`,
    },
  ];

  if (isFetching) {
    return (
      <MLoadingSpinnerContainer active />
    );
  }

  return (
    <div className="file-view">
      <DeleteFileModal
        namespace={namespace}
        slug={slug}
        projectId={gid}
        filepath={encodeURIComponent(file)}
        isModalVisible={isDeleteModalVisible}
        fileName={fileName}
        branches={branches.map((branchObj) => branchObj.name)}
        showDeleteModal={showDeleteModal}
        sourceBranch={branch}
      />
      <Navbar />
      <ProjectContainer
        activeFeature="data"
        breadcrumbs={generateBreadCrumbs(selectedProject, customCrumbs)}
      />
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
              {isImageFile === false && (
                <AuthWrapper minRole={30}>
                  <Link
                    className="btn btn-sm btn-basic-dark my-auto ml-2"
                    to={`/${namespace}/${slug}/-/tree/branch/${branch}/path/${encodeURIComponent(file)}/file/editor/edit`}
                  >
                    Edit
                  </Link>
                </AuthWrapper>
              )}
              <AuthWrapper minRole={30} norender>
                <button
                  type="button"
                  className="btn btn-sm btn-danger my-auto ml-2"
                  onClick={showDeleteModal}
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
};

FileView.propTypes = {
  match: shape({
    params: shape({
      namespace: string.isRequired,
      slug: string.isRequired,
      file: string.isRequired,
      branch: string.isRequired,
    }),
  }).isRequired,
  users: arrayOf(shape({
    name: string.isRequired,
    avatar_url: string.isRequired,
  })).isRequired,
  branches: arrayOf(
    shape({
      name: string.isRequired,
    }).isRequired,
  ).isRequired,
};

function mapStateToProps(state) {
  return {
    branches: state.branches,
    users: state.users,
  };
}

export default connect(mapStateToProps)(FileView);
