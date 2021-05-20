import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  number,
  string,
  arrayOf,
  shape,
  bool,
} from 'prop-types';
import MLoadingSpinnerContainer from 'components/ui/MLoadingSpinner/MLoadingSpinnerContainer';
import { toastr } from 'react-redux-toastr';
import hooks from 'customHooks/useSelectedProject';
import { getTimeCreatedAgo, getCommentFromCommit } from 'functions/dataParserHelpers';
import MEmptyAvatar from 'components/ui/MEmptyAvatar';
import MScrollableSection from 'components/ui/MScrollableSection/MScrollableSection';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import './commitDetails.css';
import ImageDiffSection from '../imageDiffSection/imageDiffSection';
import actions from './actionsAndFunctions';

const CommitDetails = (props) => {
  const [commits, setCommits] = useState({});
  const [imagesToRender, setImages] = useState([]);
  const [page, setPage] = useState(0);
  const [filesChanged, setFiles] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [scrolling, setScrolling] = useState(false);
  const {
    users,
    match: {
      params: {
        commitHash, namespace, slug, branch,
      },
    },
  } = props;

  const [selectedProject, isFetching] = hooks.useSelectedProject(namespace, slug);

  const loadDiffCommits = (newCommits) => {
    actions.loadDiffCommits(
      selectedProject.gid,
      newCommits,
      commitHash,
      page,
    ).then(async ({ tp, totalFilesChanged, imagePromises }) => {
      const images = await imagePromises;

      setTotalPages(tp);
      setFiles(totalFilesChanged);
      setImages(images);
    })
      .catch((err) => toastr.error('Error', err.message));
  };

  useEffect(() => {
    if (selectedProject.gid) {
      actions.getCommitDetails(selectedProject.gid, commitHash)
        .then((comms) => {
          setCommits(comms);

          loadDiffCommits(comms);
        })
        .catch((err) => err);
    }
  }, [selectedProject.gid, commitHash]);

  const handleFileScroll = useCallback(() => {
    if (scrolling) return null;
    if (page <= totalPages) return null;

    setPage(page + 1);
    setScrolling(true);
    loadDiffCommits(commits);

    return null;
  }, [scrolling, totalPages, page, commits]);

  const commitId = commits.short_id;
  let avatarUrl;
  let avatarName = '';

  const customCrumbs = [
    {
      name: 'Data',
      href: `/${namespace}/${slug}`,
    },
    {
      name: 'Commits',
      href: `/${namespace}/${slug}/-/commits/${branch}`,
    },
    {
      name: `${commitId}`,
    },
  ];

  if (isFetching) {
    return (
      <MLoadingSpinnerContainer active />
    );
  }

  users.forEach((contributor) => {
    if (contributor.name === commits.author_name) {
      avatarUrl = contributor.avatar_url;
      avatarName = contributor.name;
    }
  });

  return (
    <div id="commits-view-container">
      <Navbar />
      <ProjectContainer
        activeFeature="data"
        breadcrumbs={customCrumbs}
      />
      <br />
      <br />
      <div className="main-content">
        <div className="wrapper">
          <span className="commit-information">
            <span className="commit-authored">
              {'Commit '}
              <b>{commitId}</b>
              {` authored ${getTimeCreatedAgo(commits.authored_date, new Date())}`}
            </span>
            {avatarUrl ? (
              <a href={`/${avatarName}`}>
                <span style={{ position: 'relative' }}>
                  <img className="avatar-circle m-0" width="25" height="25" src={avatarUrl} alt="avatar" />
                </span>
              </a>
            ) : (
              <MEmptyAvatar />
            )}
            <span className="author">
              <b>
                <a href={`/${avatarName}`}>
                  {commits.author_name}
                </a>
              </b>
            </span>
          </span>
          {/*           <div className="other-options">
            <button disabled className="btn btn-outline-dark px-3 mr-2">
              Browse Files
            </button>
            <MDropdown
              label="Options"
            />
          </div>
            */}
        </div>
        <hr />
        <div className="commit-message">
          <span><b>{commits.title}</b></span>
          { getCommentFromCommit(commits.message) && (
          <div className="messages">
            <pre>{getCommentFromCommit(commits.message)}</pre>
          </div>
          )}
        </div>
        <hr />
        {filesChanged > 1000 && (
          <div className="alert pl-3 pr-3 mb-3">
            <div className="d-flex p-2">
              <i className="fas fa-exclamation-triangle mt-1" />
              <p className="m-0 pl-3">
                Too many items to show. To preserve performance only
                <b>
                  {' 1000 '}
                  of
                  {` ${filesChanged} `}
                </b>
                items are displayed
              </p>
            </div>
          </div>
        )}
        <p className="stats">
          {`Showing ${filesChanged > 1000 ? 1000 : filesChanged} files changed with`}
          <span className="addition">
            {' '}
            {commits.stats ? commits.stats.additions : 0}
            {' '}
            additions
          </span>
          {' '}
          and
          <span className="deleted">
            {' '}
            {commits.stats ? commits.stats.deletions : 0}
            {' '}
            deletions
          </span>
          .
        </p>
        <MScrollableSection className="diff-sections" handleOnScrollDown={handleFileScroll}>
          {imagesToRender.map((imageFile) => (
            <ImageDiffSection
              key={imageFile.fileName}
              fileInfo={imageFile}
              fileSize={imageFile.imageFileSize}
              original={imageFile.previousVersionFileParsed}
              modified={imageFile.nextVersionFileParsed}
            />
          ))}
        </MScrollableSection>
      </div>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    users: state.users,
  };
}

CommitDetails.propTypes = {
  users: arrayOf(shape(
    {
      id: number,
      name: string,
      username: string,
      state: string,
      avatar_url: string,
      web_url: string,
    },
  )).isRequired,
  match: shape({
    path: string,
    url: string,
    isExact: bool,
    params: shape({
      namespace: string.isRequired,
      slug: string.isRequired,
      branch: string.isRequired,
      commitHash: string.isRequired,
    }),
  }).isRequired,
};
export default connect(mapStateToProps)(CommitDetails);
