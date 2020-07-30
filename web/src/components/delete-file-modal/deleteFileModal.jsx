import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import {
  bool, string, arrayOf, func, number,
} from 'prop-types';
import { Checkbox, FormControlLabel } from '@material-ui/core';
import { toastr } from 'react-redux-toastr';
import BlueBorderedInput from '../BlueBorderedInput';
import '../../css/genericModal.css';
import './deleteFileModal.css';
import CustomizedMenus from '../customized-menu/CustomizedMenu';
import CommitsApi from '../../apis/GroupApi.ts';
import BranchesApi from '../../apis/BranchesApi.ts';
import { DELETE } from '../../dataTypes';

const commitsApi = new CommitsApi();

const DeleteFileModal = ({
  isModalVisible,
  fileName,
  branches,
  showDeleteModal,
  branchSelected,
  projectId,
  filepath,
}) => {
  const [isNewMR, setNewMR] = useState(false);
  const [commitMess, setCommitMess] = useState('');
  const [targetBranch, setTargetBranch] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const isEnabledDeleteBtn = commitMess.length > 0
    && (targetBranch.length > 0 || newBranchName.length > 0);
  const [loading, setLoading] = useState(false);
  const [urlToRedirectTo, setUrlToRedirectTo] = useState('');
  let placeholder = 'Select target branch';
  if (newBranchName !== '') {
    placeholder = newBranchName;
  } else if (targetBranch !== '') {
    placeholder = targetBranch;
  }
  function createCommit(url, branch) {
    commitsApi.performCommit(
      projectId,
      filepath,
      null,
      branch,
      commitMess,
      DELETE,
    ).then(() => {
      toastr.success('Success', 'File deleted successfully');
      setUrlToRedirectTo(url);
    }).catch((err) => {
      toastr.error('Error', err.message);
    });
  }

  function createBranchAndCommit(redirectUrl, newBranch) {
    const brancheApi = new BranchesApi();
    brancheApi.create(
      projectId,
      newBranch,
      branchSelected,
    ).then(() => {
      toastr.success('Success', `Branch ${newBranch} created`);
      createCommit(redirectUrl, newBranch);
    })
      .catch((err) => toastr.error('Error', err.message));
  }

  if (urlToRedirectTo !== '') return <Redirect to={urlToRedirectTo} />;

  return (
    <div className={`modal dark-cover modal-danger ${isModalVisible ? 'show' : ''}`}>
      <div className="modal-container">
        <div className="modal-container-close">
          <button
            type="button"
            label="close"
            className="btn btn-hidden fa fa-times"
            onClick={() => {
              setNewBranchName('');
              setCommitMess('');
              setTargetBranch('');
              showDeleteModal();
            }}
          />
        </div>

        <div className="modal-header">
          {`Delete: ${fileName}`}
        </div>

        <div className="modal-content">
          <BlueBorderedInput
            id="commit-message"
            defaultValue={`Delete ${fileName}`}
            multiline
            rows="4"
            style={{ width: '100%' }}
            onChange={(e) => { setCommitMess(e.target.value); }}
          />
          <br />
          <br />
          <CustomizedMenus
            placeholder={placeholder}
            options={branches}
            menuTitle="Select a branch"
            onOptionSelectedHandler={setTargetBranch}
            onInputChangeHandler={setNewBranchName}
          />
          {(newBranchName.length > 0 || targetBranch.length > 0) && (
          <>
            <br />
            <br />
            <FormControlLabel
              control={(
                <Checkbox
                  id="span-new-merge-req"
                  checked={isNewMR}
                  color="primary"
                  inputProps={{
                    'aria-label': 'primary checkbox',
                  }}
                  onClick={() => setNewMR(!isNewMR)}
                />
            )}
              id="span-new-merge-req-lab"
              label="Start a new merge request with these changes"
            />
          </>
          )}
        </div>

        <div className="modal-action d-flex">
          <button
            type="button"
            className="btn btn-outline-danger my-3 ml-3 mr-auto"
            onClick={() => {
              setNewBranchName('');
              setCommitMess('');
              setTargetBranch('');
              showDeleteModal();
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger m-3"
            disabled={!isEnabledDeleteBtn}
            onClick={() => {
              setLoading(!loading);
              const baseUrl = `/my-projects/${projectId}`;
              const isBranchExisting = (newBranchName === '');
              if (isBranchExisting && isNewMR) {
                createCommit(`${baseUrl}/${targetBranch}/new-merge-request`, targetBranch);
              } else if (!isBranchExisting && isNewMR) {
                createBranchAndCommit(`${baseUrl}/${newBranchName}/new-merge-request`, newBranchName);
              } else if (isBranchExisting && !isNewMR) {
                createCommit(`${baseUrl}/${targetBranch}`, targetBranch);
              } else if (!isBranchExisting && !isNewMR) {
                createBranchAndCommit(`${baseUrl}/${newBranchName}`, newBranchName);
              }
            }}
          >
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
};

DeleteFileModal.propTypes = {
  isModalVisible: bool.isRequired,
  projectId: number.isRequired,
  filepath: string.isRequired,
  fileName: string,
  branchSelected: string.isRequired,
  branches: arrayOf(string).isRequired,
  showDeleteModal: func.isRequired,
};

DeleteFileModal.defaultProps = {
  fileName: 'filename',
};

export default DeleteFileModal;
