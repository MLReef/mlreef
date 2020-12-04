import React from 'react';
import './ExperimentCancellationModal.scss';
import { PENDING, RUNNING, SUCCESS } from 'dataTypes';
import {
  string, shape, number,
} from 'prop-types';

const ExperimentCancellationModal = ({
  experimentToAbort,
}) => {
  let experimentStatusColor;
  switch (experimentToAbort.status) {
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
    <div>
      <p id="question-to-abort">
        Are you sure you want to abort the experiment:
        {' '}
        <b>{experimentToAbort.name}</b>
      </p>
      <div id="information-div">
        <div id="experiment-status" className="d-flex">
          <p>Status:</p>
          <br />
          <p style={{ color: experimentStatusColor }}>
            <b>{experimentToAbort.status}</b>
          </p>
        </div>
        <p id="training-time" />
        <p id="owner">
          Owner:
          {' '}
          <b>{experimentToAbort.authorName}</b>
        </p>
      </div>
    </div>
  );
};

ExperimentCancellationModal.propTypes = {
  experimentToAbort: shape({
    status: string.isRequired,
    name: string.isRequired,
    authorName: string.isRequired,
    pipelineJobInfo: shape({
      id: number.isRequired,
    }).isRequired,
  }).isRequired,
};

export default ExperimentCancellationModal;
