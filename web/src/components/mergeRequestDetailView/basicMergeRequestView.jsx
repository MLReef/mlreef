import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  number, shape, string, arrayOf,
} from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import { Redirect } from 'react-router';

import ChangesMrSection from 'components/changes-mr-section/ChangesMrSection';
import Navbar from '../navbar/navbar';
import CommitsList from '../commitsList';
import mergeRequestAPI from '../../apis/mergeRequestApi';
import BranchesApi from '../../apis/BranchesApi';
import { getTimeCreatedAgo } from '../../functions/dataParserHelpers';
import ProjectContainer from '../projectContainer';
import BlackBorderedButton from '../BlackBorderedButton';
import './basicMR.css';

const BasicMergeRequestView = (props) => {
  let status;
  let mergerName;
  let mergerAvatar;
  let mergedAt;
  let closeName;
  let closeAvatar;
  let closedAt;
  let editMR;

  const [mrInfo, setMRInfo] = useState({});
  const [behind, setBehind] = useState(0);
  const [aheadCommits, setAheadCommits] = useState([]);
  const [diffs, setDiffs] = useState([]);
  const [areChangesRequired, setAreChangesRequired] = useState(false);
  const [squash, setSquash] = useState(false);
  const [removeBranch, setRemoveBranch] = useState(false);
  const [redirectMR, setRedirect] = useState(false);

  const {
    selectedProject, selectedProject: { id }, match: { params: { iid } }, users,
  } = props;
  const { title, description, state } = mrInfo;

  const projectName = selectedProject.name;
  const groupName = selectedProject.namespace.name;

  const sourceBranch = mrInfo.source_branch;
  const targetBranch = mrInfo.target_branch;
  const createdAt = mrInfo.created_at;
  const updatedAt = mrInfo.updated_at;
  const hasConflicts = mrInfo.has_conflicts;

  const name = mrInfo.author && mrInfo.author.name;
  const avatarUrl = mrInfo.author && mrInfo.author.avatar_url;

  const handleButton = () => {
  };

  const squashCommits = () => {
    setSquash(!squash);
  };

  const removeSourceBranch = () => {
    setRemoveBranch(!removeBranch);
  };

  const acceptMergeRequest = () => {
    mergeRequestAPI.acceptMergeRequest(id, iid, squash, removeBranch)
      .then(() => {
        setRedirect(true);
      })
      .catch((err) => err);
  };

  if (state === 'opened') {
    status = <span className="state-config opened">OPEN</span>;
    editMR = <BlackBorderedButton className="left-margin" id="close-mr-btn" onClickHandler={handleButton} textContent="Close Merge Request" />;
  } else if (state === 'closed') {
    closeName = mrInfo.closed_by.name;
    closeAvatar = mrInfo.closed_by.avatar_url;
    closedAt = mrInfo.closed_at;
    status = <span className="state-config closed">CLOSED</span>;
    editMR = <BlackBorderedButton className="left-margin" id="reopen-mr-btn" onClickHandler={handleButton} textContent="Reopen Merge Request" />;
  } else if (state === 'merged') {
    mergerName = mrInfo.merged_by.name;
    mergerAvatar = mrInfo.merged_by.avatar_url;
    mergedAt = mrInfo.merged_at;
    status = <span className="state-config merged">MERGED</span>;
  }

  useEffect(() => {
    mergeRequestAPI.getSingleMR(id, iid)
      .then((res) => {
        setMRInfo(res);
      })
      .catch((err) => err);

    BranchesApi.compare(id, sourceBranch, targetBranch)
      .then((res) => setBehind(res.commits)).catch((err) => err);
    BranchesApi.compare(id, targetBranch, sourceBranch)
      .then((res) => {
        setAheadCommits(res.commits);
        setDiffs(res.diffs);
      }).catch((err) => err);
  }, [id, iid, targetBranch, sourceBranch, areChangesRequired]);

  return (
    <>
      {redirectMR && <Redirect to={`/my-projects/${id}/merge-requests/${iid}`} />}
      <Navbar />
      <ProjectContainer
        project={selectedProject}
        activeFeature="data"
        folders={[groupName, projectName, 'Data', 'Merge requests', iid]}
      />
      <div className="main-content">
        <div style={{ display: 'flex', marginTop: '1em' }}>
          <div style={{ flex: '1' }}>
            <p style={{ marginBottom: '0' }}>
              {status}
              <span style={{ fontWeight: '600' }}>{title}</span>
            </p>
            <div style={{ display: 'flex' }}>
              <p>
                Opened
                {' '}
                {getTimeCreatedAgo(createdAt, new Date())}
                {' '}
                ago by
                {' '}
              </p>
              <img className="avatar-style ml-2 mr-1 my-auto" width="24" src={avatarUrl} alt="avatar" />
              <span className="my-auto"><b>{name}</b></span>
            </div>
          </div>
          <div style={{ height: 'max-content' }} className="modify-MR mr-0">
            <BlackBorderedButton
              id="edit-btn"
              className="left-margin"
              onClickHandler={() => <Redirect to={`/my-projects/${id}/${sourceBranch}/new-merge-request`} />}
              textContent="Edit"
            />
            {editMR}
          </div>
        </div>
        <br />
        <div className="tabset">
          <input
            type="radio"
            name="tabset"
            id="tab1"
            aria-controls="overview"
            defaultChecked
          />
          <label htmlFor="tab1">Overview</label>

          <input
            type="radio"
            name="tabset"
            id="tab2"
            aria-controls="commits"
          />
          <label htmlFor="tab2">
            {aheadCommits.length}
            {' '}
            Commits
          </label>

          <input
            id="tab3"
            type="radio"
            name="tabset"
            aria-controls="changes"
            onClick={() => {
              if (!areChangesRequired) {
                setAreChangesRequired(!areChangesRequired);
              }
            }}
          />
          <label htmlFor="tab3">Changes</label>

          <div className="tab-panels">
            <section id="overview" className="tab-panel">
              {description && (
              <div style={{ padding: '1em 2em' }}>
                {description}
                <p className="faded-style">
                  Edited
                  {' '}
                  {getTimeCreatedAgo(updatedAt, new Date())}
                  {' '}
                  ago
                </p>
              </div>
              )}
              <div className="request-to-merge">
                <b>Request to merge</b>
                {'  '}
                {sourceBranch}
                {'  '}
                <b>into </b>
                {'  '}
                {targetBranch}
                {state === 'opened' && (
                <p>
                  The source branch is
                  {' '}
                  <b className="addition">
                    {aheadCommits.length}
                    {' '}
                    commits ahead
                  </b>
                  {' '}
                  and
                  <b className="deleted">
                    {' '}
                    {behind.length}
                    {' '}
                    commits behind
                    {' '}
                  </b>
                   target branch.
                </p>
                )}
              </div>
              <div className="vertical" />
              <div className="state-box">

                {state === 'merged'
                  && (
                  <div>
                    <h4 style={{ display: 'flex' }}>
                      <b>
                        Merged by
                      </b>
                      <div style={{ margin: '0 4px 0 2px' }}>
                        <img className="avatar-style" width="16" src={mergerAvatar} alt="avatar" />
                      </div>
                      {mergerName}
                      {' '}
                      {getTimeCreatedAgo(mergedAt, new Date())}
                      {' '}
                      ago
                      <button className="revert-merge" type="button">Revert</button>
                    </h4>
                    <section>
                      <p>
                          The changes were not merged into
                        {' '}
                        {targetBranch}
                      </p>
                      <p>
                        {(mrInfo.force_remove_source_branch || mrInfo.should_remove_source_branch)
                      && (
                        <span>The source branch has been deleted</span>
                      ) }
                      </p>
                    </section>
                  </div>
                  )}

                {state === 'closed'
                  && (
                    <div>
                      <h4 style={{ display: 'flex' }}>
                        Closed by
                        <div style={{ margin: '0 4px 0 2px' }}>
                          <img className="avatar-style" width="16" src={closeAvatar} alt="avatar" />
                        </div>
                        {closeName}
                        {' '}
                        {getTimeCreatedAgo(closedAt, new Date())}
                        {' '}
                        ago
                      </h4>
                      <section>
                        <p>
                          The changes were not merged into
                          {' '}
                          {targetBranch}
                        </p>
                      </section>
                    </div>
                  )}

                {state === 'opened'
                    && (
                      <>
                        <div style={{ display: 'flex' }}>
                          <button 
                            className="merge-action btn btn-primary" 
                            type="button" 
                            disabled={hasConflicts} 
                            onClick={acceptMergeRequest}>
                            Merge
                          </button>
                          {!hasConflicts ? (
                            <>
                              <div style={{ marginLeft: '1em' }}>
                                <Checkbox
                                  id="delete"
                                  color="primary"
                                  inputProps={{
                                    'aria-label': 'primary checkbox',
                                  }}
                                  checked={removeBranch}
                                  onChange={removeSourceBranch}
                                />
                                <span>Delete source branch </span>
                              </div>
                              <div style={{ marginLeft: '1em' }}>
                                <Checkbox
                                  id="delete"
                                  color="primary"
                                  inputProps={{
                                    'aria-label': 'primary checkbox',
                                  }}
                                  checked={squash}
                                  onChange={squashCommits}
                                />
                                <span> Squash Commits </span>
                              </div>
                            </>
                          )
                            : (
                              <section>
                                <p>
                                  There are merge conflicts&nbsp;
                                  <BlackBorderedButton id="resolve-btn" onClickHandler={handleButton} textContent="Resolve Conflicts" />
                                </p>
                              </section>
                            )}
                        </div>
                        {squash && (
                        <div>
                          <p>
                            {aheadCommits.length}
                            commits and 1 merge commit will be added into
                            {' '}
                            {targetBranch}
                          </p>
                        </div>
                        )}
                      </>
                    )}
              </div>
            </section>
            <section id="commits" className="tab-panel">
              {aheadCommits.length > 0 && (
                <CommitsList
                  commits={aheadCommits}
                  users={users}
                  projectId={selectedProject.id}
                  changesNumber={diffs.length}
                />
              )}
            </section>
            <section id="changes" className="tab-panel">
              {areChangesRequired && <ChangesMrSection projectId={id} aheadCommits={aheadCommits} />}
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

function mapStateToProps(state) {
  return {
    selectedProject: state.projects.selectedProject,
    users: state.users,
  };
}

BasicMergeRequestView.defaultProps = {
  match: {
    params: {},
  },
};

BasicMergeRequestView.propTypes = {
  match: shape({
    params: shape({
      iid: string.isRequired,
    }),
  }),
  selectedProject: shape({
    id: number.isRequired,
    name: string.isRequired,
    namespace: shape({
      name: string.isRequired,
    }).isRequired,
  }).isRequired,
  users: arrayOf(shape({})).isRequired,
};

export default connect(mapStateToProps)(BasicMergeRequestView);
