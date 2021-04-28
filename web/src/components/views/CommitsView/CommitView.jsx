import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { toastr } from 'react-redux-toastr';
import {
  string,
  shape,
  objectOf,
  func,
  arrayOf,
} from 'prop-types';
import MBranchSelector from 'components/ui/MBranchSelector';
import { generateBreadCrumbs } from 'functions/helpers';
import MEmptyAvatar from 'components/ui/MEmptyAvatar';
import hooks from 'customHooks/useSelectedProject';
import MLoadingSpinnerContainer from 'components/ui/MLoadingSpinner/MLoadingSpinnerContainer';
import { getTimeCreatedAgo } from 'functions/dataParserHelpers';
import Navbar from 'components/navbar/navbar';
import ProjectContainer from 'components/projectContainer';
import './CommitView.scss';
import actions from './actions';

export const UnconnectedCommitsView = (props) => {
  const {
    match: {
      params: {
        branch,
        path,
        namespace,
        slug,
      },
    },
    branches,
    users,
    history,
  } = props;

  const [commits, setCommits] = useState([]);
  const [commitMessageSearchedFor, setCommitMessage] = useState('');

  const [selectedProject, isFetching] = hooks.useSelectedProject(namespace, slug);

  const handleErrorsGettingCommits = (error) => toastr.error('Error', error?.message);

  const onBranchSelected = (val) => {
    const { gitlabId } = selectedProject;
    actions.getCommits(gitlabId, val)
      .then((response) => setCommits(response))
      .then(history.push(`/${namespace}/${slug}/-/commits/${val}`))
      .catch(handleErrorsGettingCommits);
  };

  useEffect(() => {
    if (selectedProject.gid) {
      actions
        .getCommits(selectedProject.gid, branch, path)
        .then((response) => setCommits(response))
        .catch(handleErrorsGettingCommits);
    }
  }, [selectedProject]);

  const customCrumbs = [
    {
      name: 'Data',
      href: `/${namespace}/${slug}`,
    },
    {
      name: 'Commits',
    },
  ];

  const distinct = [
    ...new Set(
      commits.map(
        (x) => new Date(x.committed_date)
          .toLocaleString(
            'en-eu', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            },
          ),
      ),
    )];

  if (isFetching) {
    return (
      <MLoadingSpinnerContainer active />
    );
  }
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
        <div className="commit-path">
          <MBranchSelector
            className="mr-2 mt-3"
            branches={branches}
            activeBranch={decodeURIComponent(branch)}
            onBranchSelected={onBranchSelected}
            showDatasets
            showExperiments
            showVisualizations
          />
          <input
            type="text"
            className="mt-3"
            id="commits-filter-input"
            placeholder="Filter by commit message"
            onChange={(e) => {
              const val = e.target.value;
              setCommitMessage(val);
            }}
          />
        </div>
        {distinct.map((commit, index) => (
          <div key={index.toString()} className="commit-per-date">
            <div className="commit-header">
              <p>
                Commits on
                {' '}
                {commit}
              </p>
            </div>
            {commits
              .filter((comm) => comm.title.includes(commitMessageSearchedFor)).map((item) => {
                let avatarImage = null;
                let userName = '';
                if (users) {
                  users.forEach((user) => {
                    const { name } = user;
                    const avatarUrl = user.avatar_url;
                    if (name === item.author_name) {
                      avatarImage = avatarUrl;
                      userName = name;
                    }
                  });
                }
                return (
                  new Date(item.committed_date).toLocaleString('en-eu', { day: 'numeric', month: 'short', year: 'numeric' }) === commit
                    ? (
                      <CommitDiv
                        branch={branch}
                        key={item.short_id}
                        namespace={namespace}
                        slug={slug}
                        commitid={item.id}
                        title={item.title}
                        name={item.author_name}
                        id={item.short_id}
                        time={item.committed_date}
                        avatarImage={avatarImage}
                        userName={userName}
                      />
                    )
                    : ''
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
};

export function CommitDiv(props) {
  const {
    branch,
    time,
    id,
    name,
    title,
    commitid,
    avatarImage,
    userName,
    namespace,
    slug,
  } = props;
  const spanRef = useRef();
  const today = new Date();
  const previous = new Date(time);
  const timediff = getTimeCreatedAgo(previous, today);
  const inputRef = useRef();

  function onClick() {
    const phantomInput = document.createElement('input');
    phantomInput.value = spanRef.current.innerText;
    document.body.appendChild(phantomInput);
    phantomInput.select();
    document.execCommand('copy');
    document.body.removeChild(phantomInput);
  }

  return (
    <div className="commits" key={id}>
      <div className="commit-list">
        {avatarImage
          ? (
            <Link to={`/${userName}`}>
              <span style={{ position: 'relative' }}>
                <img width="32" height="32" className="avatar-circle mt-3 ml-1" src={avatarImage} alt="avatar" />
              </span>
            </Link>
          ) : <MEmptyAvatar styleClass="avatar-sm" projectName={userName} />}
        <div className="commit-data">
          <Link to={`/${namespace}/${slug}/-/commits/${branch}/-/${commitid}`}>{title}</Link>
          <span>
            <a href={`/${userName}`}>
              {name}
            </a>
            {' '}
            authored
            {' '}
            {timediff}
          </span>
        </div>
        <div className="commit-details btn-group">
          <input type="text" ref={inputRef} style={{ display: 'none' }} />
          <span ref={spanRef} className="border-rounded-left" title={id}>{id}</span>
          <button
            title={id}
            type="button"
            label="clone"
            className="btn btn-icon fa fa-copy t-primary"
            onClick={onClick}
          />
        </div>
      </div>
    </div>
  );
}

CommitDiv.propTypes = {
  branch: string.isRequired,
  time: string.isRequired,
  id: string.isRequired,
  name: string.isRequired,
  title: string.isRequired,
  commitid: string.isRequired,
  namespace: string.isRequired,
  slug: string.isRequired,
  avatarImage: string.isRequired,
  userName: string.isRequired,
};

UnconnectedCommitsView.defaultProps = {
  match: {
    params: {},
  },
};

UnconnectedCommitsView.propTypes = {
  match: shape({
    params: shape({
      branch: string.isRequired,
      path: string,
    }),
  }),
  history: shape({
    push: func.isRequired,
  }).isRequired,
  branches: arrayOf(
    shape({
      name: string.isRequired,
    }),
  ).isRequired,
  users: arrayOf(shape({
    name: string.isRequired,
    avatar_url: string.isRequired,
  })).isRequired,
};

function mapStateToProps(state) {
  return {
    projects: state.projects,
    branches: state.branches,
    users: state.users,
  };
}

export default connect(mapStateToProps)(UnconnectedCommitsView);
