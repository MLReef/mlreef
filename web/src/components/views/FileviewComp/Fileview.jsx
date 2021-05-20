import React, { useCallback, useEffect, useState } from 'react';
import MCodeRenderer from 'components/layout/MCodefileRenderer/MCodefileRenderer';
import './Fileview.scss';
import { connect } from 'react-redux';
import { Base64 } from 'js-base64';
import { Link } from 'react-router-dom';
import {
  string, shape, arrayOf,
} from 'prop-types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import AuthWrapper from 'components/AuthWrapper';
import MDropdown from 'components/ui/MDropdown';
import MWrapper from 'components/ui/MWrapper';
import hooks from 'customHooks/useSelectedProject';
import MLoadingSpinnerContainer from 'components/ui/MLoadingSpinner/MLoadingSpinnerContainer';
import useLoading from 'customHooks/useLoading';
import MLoadingSpinner from 'components/ui/MLoadingSpinner';
import functions from './functions';

import ProjectContainer from '../../projectContainer';

import Navbar from '../../navbar/navbar';
import DeleteFileModal from '../../DeleteFileModal/DeleteFileModal';
import ContributorsSection from './ContributorsSection';
import ACCESS_LEVEL from 'domain/accessLevels';

dayjs.extend(relativeTime);

const file01 = '/images/svg/file_01.svg';

const FileView = (props) => {
  const {
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

  const fetchFileData = useCallback(() => functions.getFileAndInformation(gid, file, branch, commit)
    .then(({ fData, commitInfoDet }) => {
      setFileData(fData);
      setCommitInfo(commitInfoDet);
    }), [gid, file, branch, commit]);

  const [isLoadingFileData, executeFileFetch] = useLoading(fetchFileData);

  useEffect(() => {
    if (gid) {
      executeFileFetch();
    }
  }, [selectedProject]);

  const showDeleteModal = () => setIsModalVisible(!isDeleteModalVisible);

  const {
    author_name: authorName,
    message,
    short_id: commiterShortId,
    created_at: createdAt,
  } = commitInfo;

  let fileName = null;
  let fileSize = null;
  let fileContent = null;
  let filepath = [];
  let extension;
  let isImageFile = false;
  const filteredBranches = branches.filter((br) => !br.name.startsWith('data-pipeline/')
      && !br.name.startsWith('experiment/'));

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
    <div className="fileview">
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
        breadcrumbs={customCrumbs}
      />
      <div className="fileview-branch-path">
        <MDropdown
          label={decodeURIComponent(branch || filteredBranches[0].name)}
          component={(
            <div className="fileview-branch-path-select-branch">
              <div className="fileview-branch-path-select-branch-title">
                <p>Switch Branches</p>
              </div>
              <hr />
              <div>
                <div>
                  <ul>
                    {filteredBranches.map((fBranch) => {
                      const encoded = encodeURIComponent(fBranch.name);
                      return (
                        <li key={encoded}>
                          <div>
                            <Link
                              id={fBranch.name}
                              to={`/${namespace}/${slug}/-/tree/${encoded}`}
                            >
                              {fBranch.name}
                            </Link>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
            )}
        />

        <span className="fileview-branch-path-filepath">
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
      <div className="fileview-commit-container">
        <div className="fileview-commit-container-header">
          <div className="fileview-commit-container-header-commit-info">
            <div className="fileview-commit-container-header-commit-info-msg">
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
          <div className="fileview-commit-container-header-commit-code">
            <span>{commiterShortId}</span>
            <img className="file-icon" src={file01} alt="" />
          </div>
        </div>
        {!isFetching && gid && (
          <ContributorsSection gid={gid} />
        )}
      </div>

      <div className="fileview-file-container">
        <div className="fileview-file-container-header">
          <div className="fileview-file-container-header-file-info">
            <p>
              {fileName}
              {' '}
              |
              {fileSize}
              {' '}
              Bytes
            </p>
          </div>
          <div className="fileview-file-container-header-wrapper">
            <div className="file-actions pr-2 mt-2 d-flex">
              <Link
                to={`/${namespace}/${slug}/-/commits/file/${branch}/-/${file}`}
                className="btn btn-sm btn-basic-dark ml-2 mr-2"
                style={{ height: 'min-content' }}
              >
                History
              </Link>
              <MWrapper norender>
                <button
                  type="button"
                  className="btn btn-sm btn-basic-dark ml-2"
                >
                  Replace
                </button>
              </MWrapper>
              {isImageFile === false && (
                <AuthWrapper minRole={ACCESS_LEVEL.DEVELOPER}>
                  <Link
                    className="btn btn-sm btn-basic-dark ml-2"
                    style={{ height: 'min-content' }}
                    to={`/${namespace}/${slug}/-/tree/branch/${branch}/path/${encodeURIComponent(file)}/file/editor/edit`}
                  >
                    Edit
                  </Link>
                </AuthWrapper>
              )}
              <AuthWrapper minRole={ACCESS_LEVEL.DEVELOPER} norender>
                <button
                  type="button"
                  className="btn btn-sm btn-danger ml-2"
                  onClick={showDeleteModal}
                  style={{ height: 'min-content' }}
                >
                  Delete
                </button>
              </AuthWrapper>
            </div>
          </div>
        </div>
        {isLoadingFileData
          ? (
            <div
              className="d-flex"
              style={{
                height: '3rem',
                justifyContent: 'center',
              }}
            >
              <MLoadingSpinner active />
            </div>
          )
          : (
            <FileSection
              extension={extension}
              fileName={fileName}
              fileContent={fileContent}
              rawFileContent={fileData?.content}
            />
          )}
      </div>
    </div>
  );
};

const FileSection = ({
  extension, fileName, fileContent, rawFileContent,
}) => (
  <div
    itemProp="text"
    className="fileview-file-container-content"
  >
    <div className="fileview-file-container-content-blob">
      {extension === 'jpg' || extension === 'png' ? (
        <div className="d-flex">
          <img
            className="file-img mx-auto"
            src={`data:image/png;base64,${rawFileContent}`}
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
);

FileView.propTypes = {
  match: shape({
    params: shape({
      namespace: string.isRequired,
      slug: string.isRequired,
      file: string.isRequired,
      branch: string.isRequired,
    }),
  }).isRequired,
  branches: arrayOf(
    shape({
      name: string.isRequired,
    }).isRequired,
  ).isRequired,
};

function mapStateToProps(state) {
  return {
    branches: state.branches,
  };
}

export default connect(mapStateToProps)(FileView);
