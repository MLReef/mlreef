import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  number,
  string,
  arrayOf,
  shape,
  bool,
} from 'prop-types';
import MLoadingSpinnerContainer from 'components/ui/MLoadingSpinner/MLoadingSpinnerContainer';
import { getFileDifferences } from 'functions/apiCalls';
import hooks from 'customHooks/useSelectedProject';
import { generateBreadCrumbs } from 'functions/helpers';
import { getTimeCreatedAgo, getCommentFromCommit } from 'functions/dataParserHelpers';
import MEmptyAvatar from 'components/ui/MEmptyAvatar';
import MScrollableSection from 'components/ui/MScrollableSection/MScrollableSection';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import './commitDetails.css';
import CommitsApi from '../../apis/CommitsApi.ts';
import ImageDiffSection from '../imageDiffSection/imageDiffSection';

const imageFormats = [
  '.png',
  '.jpg',
];

const commitsApi = new CommitsApi();

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

  const getDiffDetails = (diffsArray) => {
    diffsArray.filter((diff) => imageFormats
      .filter((format) => diff.old_path.includes(format))
      .length > 0)
      .forEach(async (imageDiff) => {
        const {
          previousVersionFile,
          nextVersionFile,
          imageFileSize,
        } = await getFileDifferences(
          selectedProject.gid,
          imageDiff,
          commits.parent_ids[0],
          commits.id,
        );
        imagesToRender.push({
          previousVersionFileParsed: previousVersionFile,
          nextVersionFileParsed: nextVersionFile,
          imageFileSize,
          fileName: imageDiff.old_path.split('/').slice(-1)[0],
        });
        setImages({ ...imagesToRender });
      });
  };

  const loadDiffCommits = () => {
    commitsApi
      .getCommitDiff(selectedProject?.gid, commitHash, page, true)
      .then(({ totalPages: tp, totalFilesChanged, body }) => {
        setTotalPages(tp);
        setFiles(totalFilesChanged);
        setScrolling(false);

        getDiffDetails([...body]);
      })
      .catch(
        (err) => err,
      );
  };

  const get = () => commitsApi.getCommitDetails(selectedProject.gid, commitHash)
    .then((newCommits) => {
      setCommits(newCommits);
      loadDiffCommits();
    })
    .catch((err) => err);

  useEffect(() => {
    if (selectedProject.gid) {
      get();
    }
  }, [selectedProject]);

  const loadMoreCommits = () => {
    setPage(page + 1);
    setScrolling(true);
    loadDiffCommits();
  };

  const handleFileScroll = () => {
    if (scrolling) return null;
    if (totalPages <= page) return null;

    loadMoreCommits();

    return null;
  };

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
        breadcrumbs={generateBreadCrumbs(selectedProject, customCrumbs)}
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
    projects: state.projects,
    users: state.users,
  };
}

const project = shape(
  {
    id: string,
    gid: number,
    description: string,
    name: string,
    avatarUrl: string,
    starCount: number,
    forksCount: number,
  },
);

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
  projects: shape({
    all: arrayOf(project),
    selectedProject: project,
  }).isRequired,
};
export default connect(mapStateToProps)(CommitDetails);
