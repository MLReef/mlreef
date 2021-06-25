import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  shape, number, string, arrayOf, func,
} from 'prop-types';
import { Redirect, Link } from 'react-router-dom';
import { toastr } from 'react-redux-toastr';
import MergeRequestEdit from 'components/layout/MergeRequests/MergeRequestEdit';
import MBranchSelector from 'components/ui/MBranchSelector';
import hooks from 'customHooks/useSelectedProject';
import MLoadingSpinnerContainer from 'components/ui/MLoadingSpinner/MLoadingSpinnerContainer';
import commitDetailActions from 'components/views/CommitsDetails/actionsAndFunctions';
import CommitsList from 'components/layout/CommitsList/CommitList';
import actions from './mergeReqActions';
import ProjectContainer from '../../projectContainer';
import Navbar from '../../navbar/navbar';
import './newMergeRequest.css';
import BranchesApi from '../../../apis/BranchesApi.ts';
import ImageDiffSection from '../../imageDiffSection/imageDiffSection';

const brApi = new BranchesApi();

const getBranchFromSearch = (search) => {
  const decoded = decodeURIComponent(search.substr(1));
  const pairs = decoded.split('&').map((str) => str.split('='));
  const [, val] = pairs.find(([key, val]) => key === 'merge_request[source_branch]');

  return val;
};

const NewMergeRequest = (props) => {
  const {
    location: { search },
    history,
    branches,
    users,
    match: {
      params: {
        namespace,
        slug,
      },
    },
  } = props;

  const [selectedProject, isFetching] = hooks.useSelectedProject(namespace, slug);

  const { gid, defaultBranch } = selectedProject;

  const branch = search ? getBranchFromSearch(search) : defaultBranch;

  const [commits, setCommits] = useState([]);
  const [imagesToRender, setImagesToRender] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [branchToMergeInto, setBranchToMergeInto] = useState('');
  const [redirect, setRedirect] = useState(false);
  const [diffs, setDiffs] = useState([]);

  useEffect(() => {
    commitDetailActions.getDiffDetails(
      selectedProject.gid,
      diffs,
      commits,
    ).then(setImagesToRender);
  }, [commits, selectedProject.gid, diffs]);

  const onBranchChanged = (branchSelected) => {
    setBranchToMergeInto(branchSelected);
    brApi.compare(gid, branchSelected, branch)
      .then(async (res) => {
        setCommits(res.commits);
        setDiffs(res.diffs);
      }).catch((err) => {
        toastr.error('Error', err.message);
      });
  };

  const onTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const onDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleCancel = () => {
    history.goBack();
  };

  const handleCreateBranchEv = () => {
    actions.submit(gid, branch, branchToMergeInto, title, description)
      .then(() => {
        setRedirect(true);
      }).catch((err) => {
        toastr.error('Error: ', err.message);
      });
  };

  const isEnabledCreateMergeReq = title.length > 0
        && branchToMergeInto.length > 0;
  const customCrumbs = [
    {
      name: 'Data',
      href: `/${namespace}/${slug}`,
    },
    {
      name: 'Merge Requests',
      href: `/${namespace}/${slug}/-/merge_requests`,
    },
    {
      name: 'New',
    },
  ];

  if (isFetching) {
    return (
      <MLoadingSpinnerContainer active />
    );
  }

  return (
    <>
      {redirect && (
      <Redirect to={`/${namespace}/${slug}`} />
      )}
      <Navbar />
      <ProjectContainer
        activeFeature="data"
        breadcrumbs={customCrumbs}
      />
      <div className="main-content">
        <br />
        <p style={{ color: '#1A2B3F', fontSize: '1em' }}>
          <b>New Merge request</b>
        </p>
        <br />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          height: 'max-content',
        }}
        >
          <p id="branch-selected-name" variant="h6" component="h5" style={{ color: '#1A2B3F', fontSize: '1.1em' }}>
            from&nbsp;
            <Link to={`/${namespace}/${slug}/-/tree/${branch}`}>
              <b>{decodeURIComponent(branch)}</b>
            </Link>
              &nbsp;into
          </p>
          <div className="ml-3 my-auto flex-1">
            <MBranchSelector
              className="new-merge-request-select-box"
              branches={branches}
              onBranchSelected={onBranchChanged}
              activeBranch={branchToMergeInto || 'Select a branch...'}
              showDatasets
              showExperiments
              showVisualizations
            />
          </div>
        </div>
        <br />
        <br />
        <div style={{ borderTop: '1px solid #e5e5e5' }}>
          <MergeRequestEdit
            title={title}
            description={description}
            onTitleChange={onTitleChange}
            onDescriptionChange={onDescriptionChange}
          />
        </div>
        <div style={{
          display: 'flex',
          backgroundColor: '#F9F8F8',
          padding: '1em 2em',
          justifyContent: 'space-between',
        }}
        >
          <button
            id="cancel-button"
            type="button"
            className="btn btn-basic-dark"
            onClick={handleCancel}
          >
            Cancel
          </button>

          <button
            id="submit-merge-request"
            type="button"
            className="btn btn-primary"
            onClick={handleCreateBranchEv}
            disabled={!isEnabledCreateMergeReq}
          >
            Submit merge request
          </button>
        </div>
        <br />
        {commits.length > 0 && (
        <CommitsList
          commits={commits}
          users={users}
          projectId={gid}
          changesNumber={diffs.length}
          namespace={namespace}
          slug={slug}
          branch={branch}
        />
        )}
        {imagesToRender.map((imageFile) => (
          <ImageDiffSection
            key={imageFile.fileName}
            fileInfo={imageFile}
            fileSize={imageFile.imageFileSize}
            original={imageFile.previousVersionFileParsed}
            modified={imageFile.nextVersionFileParsed}
          />
        ))}
      </div>
    </>
  );
};

NewMergeRequest.propTypes = {
  projects: shape({
    selectedProject: shape({
      gid: number.isRequired,
    }).isRequired,
  }).isRequired,
  location: shape({
    search: string.isRequired,
  }).isRequired,
  match: shape({
    params: shape({
      namespace: string.isRequired,
      slug: string.isRequired,
    }),
  }).isRequired,
  branches: arrayOf(shape).isRequired,
  users: arrayOf(
    shape({
      name: string.isRequired,
    }).isRequired,
  ).isRequired,
  history: shape({
    goBack: func.isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    users: state.users,
    projects: state.projects,
    branches: state.branches,
  };
}

export default connect(mapStateToProps)(NewMergeRequest);
