import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import {
  bool, string, arrayOf, func, number,
} from 'prop-types';
import MCheckBox from 'components/ui/MCheckBox/MCheckBox';
import MInputSelect from 'components/ui/MInputSelect';
import MButton from 'components/ui/MButton';
import { toastr } from 'react-redux-toastr';
import deleteFileActions from './DeleteFileActions';

const DeleteFileModal = ({
  isModalVisible,
  fileName,
  branches,
  showDeleteModal,
  projectId,
  filepath,
  namespace,
  slug,
  sourceBranch,
}) => {
  const [isNewMR, setNewMR] = useState(false);
  const [commitMess, setCommitMess] = useState('');
  const [targetBranch, setTargetBranch] = useState(sourceBranch || '');
  const isEnabledDeleteBtn = commitMess.length > 0
    && targetBranch.length > 0;
  const [loading, setLoading] = useState(false);
  const [urlToRedirectTo, setUrlToRedirectTo] = useState('');

  useEffect(() => {
    setCommitMess(`Delete ${fileName}`);
  }, [fileName]);

  if (urlToRedirectTo !== '') return <Redirect to={urlToRedirectTo} />;

  return (
    <div className={`modal dark-cover modal-danger ${isModalVisible ? 'show' : ''}`}>
      <div className="modal-cover" />
      <div className="modal-container">
        <div className="modal-container-close">
          <button
            type="button"
            label="close"
            className="btn btn-hidden fa fa-times"
            onClick={() => {
              setTargetBranch('');
              showDeleteModal();
            }}
          />
        </div>

        <div className="modal-header">
          {`Delete: ${fileName}`}
        </div>

        <div className="modal-content" style={{ overflowY: 'inherit' }}>
          <div className="d-flex">
            <span className="mr-1 mt-4"><b>Commit message</b></span>
            <textarea
              id="commit-message"
              name="commit-message"
              cols="30"
              rows="5"
              defaultValue={commitMess}
              onChange={(e) => setCommitMess(e.target.value)}
            />
          </div>
          <br />
          <br />
          <div className="d-flex" style={{ alignItems: 'center' }}>
            <span className="mr-2"><b>Target branch</b></span>
            <MInputSelect
              placeholder={targetBranch}
              options={branches}
              onClick={(val) => setTargetBranch(val)}
              onInputChange={(val) => setTargetBranch(val)}
            />
          </div>
          {targetBranch.length > 0 && targetBranch !== sourceBranch ? (
            <>
              <br />
              <br />
              <MCheckBox
                name="span-new-merge-req"
                labelValue="Start a new merge request with these changes"
                callback={() => setNewMR(!isNewMR)}
              />
            </>
          ) : null}
        </div>

        <div className="modal-action d-flex">
          <button
            id="cancel-btn"
            type="button"
            className="btn btn-outline-danger my-3 ml-3 mr-auto"
            onClick={() => {
              setTargetBranch('');
              showDeleteModal();
            }}
          >
            Cancel
          </button>
          <MButton
            disabled={!isEnabledDeleteBtn}
            className="btn btn-danger m-3"
            waiting={loading}
            onClick={() => {
              setLoading(!loading);
              const baseUrl = `/${namespace}/${slug}`;
              const requestUrl = isNewMR ? `/-/merge_requests/new?merge_request[source_branch]=${targetBranch}` : `/-/tree/${targetBranch}`;
              const completeUrl = `${baseUrl}${requestUrl}`;
              deleteFileActions.createCommit(
                projectId,
                targetBranch,
                decodeURIComponent(filepath),
                commitMess,
                branches.includes(targetBranch) ? null : sourceBranch,
              )
                .then(() => {
                  toastr.success('Success', 'File deleted successfully');
                  setUrlToRedirectTo(completeUrl);
                }).catch((err) => {
                  setLoading(false);
                  toastr.error('Error', err.message);
                });
            }}
          >
            DELETE
            {' '}
          </MButton>
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
  namespace: string.isRequired,
  slug: string.isRequired,
  branches: arrayOf(string).isRequired,
  showDeleteModal: func.isRequired,
  sourceBranch: string.isRequired,
};

DeleteFileModal.defaultProps = {
  fileName: '',
};

export default DeleteFileModal;
