import React from 'react';
import { bool, func, number, string } from 'prop-types';
import { toastr } from 'react-redux-toastr';

import '../../css/globalStyles.css';
import '../../css/genericModal.css';
import { Button } from '@material-ui/core';
import branchesApi from '../../apis/BranchesApi';
import { useState } from 'react';

const DeleteBranchModal = ({
  isModalVisible,
  toggleIsModalVisible,
  projectId,
  branchName,
}) => {
  const [isDeleteButtonDisabled, setIsDeleteButtonDisabled] = useState(false);
  function callDeleteBranchApi(){    
    branchesApi.delete(
      projectId, 
      branchName
    ).then((res) => {
      toastr.success("Success", res.message);
      toggleIsModalVisible("", true);
      setIsDeleteButtonDisabled(!isDeleteButtonDisabled);
    })
    .catch(() => {
      toastr.error("Error", "Something failed, try it later");
      setIsDeleteButtonDisabled(!isDeleteButtonDisabled);
    });
  }

  if (!isModalVisible) {
    return null;
  }
  return (
    <div className="generic-modal">
      <div className="modal-content" style={{
          height: 'max-content',
          width: '50%',
          minWidth: 200,
          minHeight: 200,
          left: '25%',
        }}
      >
        <div
          className="title"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f5544d',
            color: 'white',
            padding: '0.5em 1em',
          }}
        >
          <p style={{ margin: 0 }}>
            {' '}
            Delete branch:&nbsp;
            {branchName}
          </p>
          <button 
            onClick={() => toggleIsModalVisible("", false)} 
            className="dangerous-red" 
            style={{ border: '1px solid transparent', cursor: 'pointer' }}
          >
            <b>X</b>
          </button>
        </div>
        <div id="message-content">
          <p style={{fontWeight: '700'}}>Are you sure that you want to delete your branch: {branchName}</p>
          <p>Deleting the branch "{branchName}" cannot be undone.</p>
          <p>Are you sure?</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0em 1.5em', marginTop: '2em' }}>
          <Button onClick={() => toggleIsModalVisible("", false)} variant="outlined">Cancel</Button>
          <button
            disabled={isDeleteButtonDisabled}
            onClick={() => {
              setIsDeleteButtonDisabled(!isDeleteButtonDisabled);
              callDeleteBranchApi();
            }} 
            className="dangerous-red" 
            style={{ borderRadius: '0.2em', padding: '0em 1em', cursor: 'pointer' }}
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
