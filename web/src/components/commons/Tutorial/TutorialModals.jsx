import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

const TutorialModals = (props) => {
  const {
    className,
    modalType,
    payload,
    onClose,
    onExitTutorial,
    onResumeTutorial,
    onStartFreshTutorial,
  } = props;

  const handleClick = (callback = (e) => e) => () => {
    onClose();
    return callback(payload);
  };

  return (
    <div className={cx('tutorial-modal border-rounded', className, modalType === 'exit' ? 'bg-danger' : 'bg-info')}>
      {modalType === 'exit' && (
        <>
          <div className="tutorial-modal-content">
            <h5 className="tutorial-modal-content-title">
              This will end your tutorial
            </h5>
            <p>Are you sure?</p>
          </div>
          <div className="tutorial-modal-actions">
            <button
              type="button"
              className="btn btn-sm btn-basic-dark"
              onClick={handleClick()}
            >
              No
            </button>
            <button
              type="button"
              className="btn btn-sm ml-auto btn-basic-dark"
              onClick={handleClick(onExitTutorial)}
            >
              Yes
            </button>
          </div>
        </>
      )}

      {modalType === 'resume' && (
        <>
          <div className="tutorial-modal-content">
            <h5 className="tutorial-modal-content-title">
              You have a session saved.
            </h5>
            <p>Do you want to resume it?</p>
          </div>
          <div className="tutorial-modal-actions">
            <button
              type="button"
              className="btn btn-sm btn-basic-dark"
              onClick={handleClick(onStartFreshTutorial)}
            >
              No
            </button>
            <button
              type="button"
              className="btn btn-sm ml-auto btn-basic-dark"
              onClick={handleClick(onResumeTutorial)}
            >
              Yes
            </button>
          </div>
        </>
      )}
    </div>
  );
};

TutorialModals.defaultProps = {
  className: '',
};

TutorialModals.propTypes = {
  className: PropTypes.string,
  modalType: PropTypes.string.isRequired,
  // eslint-disable-next-line
  payload: PropTypes.any,
  onClose: PropTypes.func.isRequired,
  onExitTutorial: PropTypes.func.isRequired,
  onResumeTutorial: PropTypes.func.isRequired,
  onStartFreshTutorial: PropTypes.func.isRequired,
};

export default TutorialModals;
