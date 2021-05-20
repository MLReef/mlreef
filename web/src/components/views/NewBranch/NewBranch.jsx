import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
  arrayOf, string, shape, func,
} from 'prop-types';
import { Redirect } from 'react-router-dom';
import { toastr } from 'react-redux-toastr';
import MInput from 'components/ui/MInput';
import MSelect from 'components/ui/MSelect';
import MButton from 'components/ui/MButton';
import ProjectContainer from 'components/projectContainer';
import Navbar from 'components/navbar/navbar';

import { validateBranchName } from 'functions/validations';
import './NewBranch.scss';
import hooks from 'customHooks/useSelectedProject';
import useLoading from 'customHooks/useLoading';
import { MLoadingSpinnerContainer } from 'components/ui/MLoadingSpinner';
import actions from './actions';

const NewBranch = (props) => {
  const {
    history,
    branches,
    match: {
      params: {
        namespace,
        slug,
      },
    },
  } = props;

  const [selectedProject, isFetching] = hooks.useSelectedProject(namespace, slug);
  const { gid } = selectedProject;

  const [branchSelected, setBranchSelected] = useState(null);
  const [newBranchName, setNewBranchName] = useState('');
  const [redirect, setRedirect] = useState(false);

  const callCreate = () => actions
    .createBranch(
      gid,
      newBranchName,
      branchSelected,
    )
    .then(() => {
      setRedirect(true);
      toastr.success('Success:', 'The branch was created');
    })
    .catch((err) => toastr.error('Error:', err.message));

  const [isWaiting, executeCall] = useLoading(callCreate);

  const handleCancel = () => {
    history.goBack();
  };

  const customCrumbs = [
    {
      name: 'Data',
      href: `/${namespace}/${slug}`,
    },
    {
      name: 'Branches',
      href: `/${namespace}/${slug}/-/branches`,
    },
    {
      name: 'New',
    },
  ];

  const isValidBranchName = validateBranchName(newBranchName);
  const isEnabledCreateBranchButton = ((branchSelected !== null && branchSelected !== '') && isValidBranchName);

  if (isFetching) {
    return (
      <MLoadingSpinnerContainer active />
    );
  }

  return redirect ? (
    <Redirect to={`/${namespace}/${slug}/-/tree/${encodeURIComponent(newBranchName)}`} />
  ) : (
    <>
      <Navbar />
      <ProjectContainer
        activeFeature="data"
        breadcrumbs={customCrumbs}
      />

      <div className="new-branch-view main-content">
        <div className="new-branch-view-title">
          <h4 className="t-dark">
            New branch
          </h4>
        </div>

        <div className="new-branch-view-content">
          <div className="new-branch-view ml-5">
            <MInput
              className="mb-2"
              id="new-branch-name"
              placeholder="Branch name"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              error={newBranchName !== '' && !isValidBranchName && 'Invalid name.'}
            />

            <MSelect
              id="branches-select"
              label="Create from"
              options={branches.map((b) => ({ label: b, value: b }))}
              value={branchSelected}
              onSelect={setBranchSelected}
            />
          </div>
          <div className="new-branch-view-actions">
            <button
              type="button"
              className="btn btn-basic-dark"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <MButton
              id="create-branch-btn"
              onClick={() => executeCall()}
              disabled={!isEnabledCreateBranchButton}
              waiting={isWaiting}
              className="btn btn-primary"
            >
              Create Branch
            </MButton>
          </div>
        </div>
      </div>
    </>
  );
};

NewBranch.propTypes = {
  match: shape({
    params: shape({
      namespace: string.isRequired,
      slug: string.isRequired,
    }).isRequired,
  }).isRequired,
  history: shape({
    goBack: func.isRequired,
  }).isRequired,
  branches: arrayOf(string).isRequired,
};

function mapStateToProps(state) {
  return {
    branches: state.branches.map((branch) => branch.name),
  };
}

export default connect(mapStateToProps)(NewBranch);
