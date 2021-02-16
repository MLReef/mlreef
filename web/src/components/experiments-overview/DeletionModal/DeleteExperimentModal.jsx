// this component is kept for comparison purposes and for a quick roll back if needed
// called by ../ExperimentSummary
import React from 'react';
import { RUNNING, SUCCESS, PENDING } from 'dataTypes';
import {
  shape, func, bool, string,
} from 'prop-types';

const DeleteExperimentModal = ({
  experiment,
  handleDeleteExp,
  handleCloseModal,
  shouldRender,
}) => {
  let experimentStatusColor;
  switch (experiment.status) {
    case RUNNING:
      experimentStatusColor = 'var(--success)';
      break;
    case SUCCESS:
      experimentStatusColor = 'var(--success)';
      break;
    case PENDING:
      experimentStatusColor = 'var(--warning)';
      break;
    default:
      experimentStatusColor = 'var(--danger)';
      break;
  }
  return (
    <div id="select-data-modal-div">
      <p id="question-for-delete-exp">
        Are you sure you want to delete the experiment:
        {' '}
        <b>{experiment.name}</b>
      </p>
      <div id="information-div">
        <div id="experiment-status" className="d-flex">
          <p>Status:</p>
          <br />
          <p style={{ color: experimentStatusColor }}>
            <b>{experiment.status}</b>
          </p>
        </div>
        <p id="training-time" />
        <p id="owner">
          Owner:
          {' '}
          <b>{experiment.authorName}</b>
        </p>
      </div>
    </div>
  );
};

DeleteExperimentModal.propTypes = {
  experiment: shape({
    id: string.isRequired,
    status: string.isRequired,
    name: string.isRequired,
    authorName: string.isRequired,
  }).isRequired,
  handleDeleteExp: func.isRequired,
  handleCloseModal: func.isRequired,
  shouldRender: bool.isRequired,
};

export default DeleteExperimentModal;
