import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import TutorialExecutionTask from './TutorialExecutionTask';
import { useContextValue } from './context';

const TutorialExecution = (props) => {
  const {
    steps,
    rules,
    actions,
    onCompleted,
  } = props;

  const [{ status }, ctxDispatch] = useContextValue();
  const currentStep = steps.find((s) => s.id === status?.step) || steps[0];
  const finalStep = !steps.find((s) => s.id === (status?.step || 0) + 1);

  const updateDone = useCallback(
    ({ task = status.task, step = status.step }) => {
      const [stepDone, taskDone] = status.done;

      if (step < stepDone) return status.done;

      if (step > stepDone) return [step, 0];

      return [step, Math.max(task, taskDone)];
    },
    [status],
  );

  // console.log('done', status.done);

  const handleCompletedTask = (id) => () => {
    const checkIsFinalTask = () => {
      const totalTasks = currentStep.tasks.length;

      return currentStep.id === status.total && id === totalTasks;
    };

    const [stepDone, taskDone] = status.done;
    if (stepDone !== currentStep.id || taskDone + 1 !== id) return false;

    const totalTasks = currentStep.tasks.length;
    const payload = id < totalTasks ? { task: id } : { step: status.step + 1 };
    const newStatus = checkIsFinalTask() ? {
      ...status,
      step: currentStep.id,
      tast: totalTasks,
      done: [currentStep.id, totalTasks],
    } : {
      ...status,
      step: currentStep.id + (id < totalTasks ? 0 : 1),
      task: 1 + (id < totalTasks ? id : 0),
      done: updateDone(payload),
    };

    if (checkIsFinalTask()) onCompleted();

    if (actions) actions.updateCurrent(newStatus);

    ctxDispatch({ type: 'SHOW_DIALOG' });
    ctxDispatch({ type: 'SET_STATUS', status: newStatus });

    return true;
  };

  const handleDisplayImage = (image) => {
    if (actions) actions.displayImage(image);
  };

  const showExitModal = () => {
    ctxDispatch({ type: 'SHOW_MODAL' });
  };

  const goToPrev = () => {
    const newStatus = {
      ...status,
      step: status.step - 1,
    };
    ctxDispatch({ type: 'SET_STATUS', status: newStatus });
  };

  const goNextStep = () => {
    const newStatus = {
      ...status,
      step: status.step + 1,
      task: 1,
    };
    ctxDispatch({ type: 'SET_STATUS', status: newStatus });
  };

  return (
    <div className="tutorial-dialog">
      {currentStep.tasks.map((task) => (
        <TutorialExecutionTask
          key={`task-${task.id}`}
          id={task.id}
          layoutType={task.layoutType}
          validators={task.validators}
          title={task.title}
          instructions={task.instructions}
          image={task.image}
          onDisplayImage={handleDisplayImage}
          feedback={task.feedback}
          rules={rules}
          onCompleted={handleCompletedTask(task.id)}
        />
      ))}

      <div className="tutorial-dialog-actions">
        <button
          type="button"
          className="btn btn-sm btn-basic-dark mr-2 px-3"
          disabled={status.step === 1}
          onClick={goToPrev}
        >
          Previous
        </button>
        <button
          type="button"
          label="close"
          onClick={showExitModal}
          className="btn btn-sm fa fa-times px-2 btn-icon btn-danger"
        />

        <button
          type="button"
          className="btn btn-sm btn-primary ml-auto px-3"
          disabled={finalStep}
          onClick={goNextStep}
        >
          Next
        </button>
      </div>
    </div>
  );
};

TutorialExecution.defaultProps = {
  actions: undefined,
};

TutorialExecution.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.shape).isRequired,
  rules: PropTypes.shape({}).isRequired,
  actions: PropTypes.shape({
    updateCurrent: PropTypes.func,
    displayImage: PropTypes.func,
  }),
  onCompleted: PropTypes.func.isRequired,
};

export default TutorialExecution;
