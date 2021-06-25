import React, { useState } from 'react';
import { bool, func, number, string } from 'prop-types';
import { toastr } from 'react-redux-toastr';
import BranchesApi from 'apis/BranchesApi.ts';

const brApi = new BranchesApi();

const DeleteBranchModal = ({
  isModalVisible,
  toggleIsModalVisible,
  projectId,
  branchName,
}) => {
  const [isDeleteButtonDisabled, setIsDeleteButtonDisabled] = useState(false);

  function callDeleteBranchApi() {
    setIsDeleteButtonDisabled(true);

    return brApi.delete(
      projectId,
      branchName,
    )
      .then((res) => {
        toastr.success('Success', res.message);
        toggleIsModalVisible('', true);
      })
      .catch(() => {
        toastr.error('Error', 'Something failed, try it later');
      })
      .finally(() => setIsDeleteButtonDisabled(false));
  }

  return (
    <div className={`modal dark-cover modal-danger ${isModalVisible ? 'show' : ''}`}>
      <div className="modal-cover" />
      <div className="modal-container">
        <div className="modal-container-close">
          <button
            type="button"
            label="close"
            className="btn btn-hidden fa fa-times"
            onClick={() => toggleIsModalVisible('', false)}
          />
        </div>
        <div className="modal-header">
          {`Delete branch: ${branchName}`}
        </div>
        <div className="modal-content">
          <p style={{fontWeight: '700'}}>
            Are you sure that you want to delete your branch: {branchName}
          </p>
          <p>Deleting the branch "{branchName}" cannot be undone.</p>
          <p>Are you sure?</p>
        </div>
        <div className="modal-action d-flex">
          <button
            type="button"
            className="btn btn-outline-danger my-3 ml-3 mr-auto"
            onClick={() => toggleIsModalVisible('', false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger m-3"
            disabled={isDeleteButtonDisabled}
            onClick={callDeleteBranchApi}
          >
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
};

DeleteBranchModal.propTypes = {
  isModalVisible: bool.isRequired,
  toggleIsModalVisible: func.isRequired,
  projectId: number.isRequired,
  branchName: string.isRequired,
};

export default DeleteBranchModal;
