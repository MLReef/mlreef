import React from 'react';
import './ExperimentCancellationModal.scss';
import { PENDING, RUNNING, SUCCESS } from 'dataTypes';
import { string, shape, bool, func, number } from 'prop-types';

const ExperimentCancellationModal = ({
  experimentToAbort,
  shouldComponentRender,
  abortClickHandler,
  closeModal,
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
  if (!shouldComponentRender) {
    return null;
  }
  return (
    <div id="select-data-modal-div" className="modal modal-danger modal-lg dark-cover show">
      <div className="modal-cover" />
      <div className="modal-container experiment-modal">
        <div className="modal-container-close">
          <button
            id="close-modal"
            type="button"
            label="close"
            onClick={() => closeModal()}
            className="btn btn-hidden fa fa-times"
          />
        </div>
        <div className="modal-header">
          <div>
            Abort running experiments?
          </div>
        </div>
        <div className="modal-content">
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
          <div id="buttons-container">
            <button
              id="cancel-aborting-experiment"
              type="button"
              className="btn btn-danger btn-label-sm mr-2"
              onClick={() => closeModal()}
            >
              Cancel
            </button>
            <button
              id="abort-experiment"
              type="button"
              className="btn btn-danger btn-label-sm mr-2"
              onClick={() => abortClickHandler(experimentToAbort.pipelineJobInfo.id)}
            >
              Abort
            </button>
          </div>
        </div>
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
  shouldComponentRender: bool.isRequired,
  abortClickHandler: func.isRequired,
  closeModal: func.isRequired,
};

export default ExperimentCancellationModal;
