import React, { useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import cx from 'classnames';
import { useContextValue } from './context';

// eslint-disable-next-line
const LinkWrapped = ({ href, children, ...props }) => (
  // eslint-disable-next-line
  <Link {...props} to={href}>
    {children}
  </Link>
);

const TutorialExecutionTask = (props) => {
  const {
    rules,
    id,
    layoutType,
    validators,
    title,
    instructions,
    image,
    feedback,
    onCompleted,
    onDisplayImage,
  } = props;

  const [{ status, meta: { username } }] = useContextValue();
  rules.useValidators(validators, onCompleted, { username });
  const elRef = useRef();

  const taskStatus = useMemo(
    () => {
      const [stepDone, taskDone] = status.done;

      if (stepDone > status.step) return 'done';
      if (stepDone < status.step) return 'pending';
      if (id - 1 > taskDone) return 'pending';
      if (id - 1 === taskDone) return 'active';
      return 'done';
    },
    [status, id],
  );

  const disabled = useMemo(
    () => taskStatus !== 'active',
    [taskStatus],
  );

  const buttonLabel = useMemo(
    () => taskStatus === 'active' ? 'Mark as done' : taskStatus,
    [taskStatus],
  );

  useEffect(
    () => {
      if (taskStatus === 'active') {
        setTimeout(() => {
          if (elRef.current) {
            elRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    },
    [taskStatus],
  );

  return (
    <>
      {layoutType === 1 && (
        <section ref={elRef} className={cx('tutorial-dialog-card border-rounded', { disabled })}>
          {image && (
            // eslint-disable-next-line
            <div
              onClick={() => onDisplayImage(image)}
              className="tutorial-dialog-card-image border-rounded"
              style={{ backgroundImage: `url(${image})` }}
            />
          )}
          <div className="tutorial-dialog-card-container">
            <span className="tutorial-dialog-card-step">
              {id}
            </span>
            <div className="tutorial-dialog-card-content">
              <h4 className="tutorial-dialog-card-content-title">
                {title}
              </h4>
              <div className="tutorial-dialog-card-content-description">
                <ReactMarkdown
                  source={instructions}
                  renderers={{ link: LinkWrapped }}
                />
              </div>
              <div className="tutorial-dialog-card-content-actions">
                <button
                  type="button"
                  className="tutorial-dialog-card-content-actions-btn-link"
                  disabled={disabled}
                  onClick={() => onCompleted(id)}
                >
                  {buttonLabel}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
      {layoutType === 2 && (
        <section ref={elRef} className={cx('tutorial-dialog-card border-rounded', { disabled })}>
          <div className="tutorial-dialog-card-container">
            <div className="tutorial-dialog-card-content">
              <div className="tutorial-dialog-card-content-description">
                <ReactMarkdown
                  source={feedback}
                  renderers={{ link: LinkWrapped }}
                />
              </div>
              {image && (
                // eslint-disable-next-line
                <div
                  onClick={() => onDisplayImage(image)}
                  className="tutorial-dialog-card-image border-rounded"
                  style={{ backgroundImage: `url(${image})` }}
                />
              )}

              <div className="tutorial-dialog-card-content-actions">
                <button
                  type="button"
                  className="tutorial-dialog-card-content-actions-btn-link"
                  disabled={disabled}
                  onClick={() => onCompleted(id)}
                >
                  {buttonLabel}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

TutorialExecutionTask.defaultProps = {
  feedback: null,
  title: '',
  instructions: '',
  image: null,
};

TutorialExecutionTask.propTypes = {
  rules: PropTypes.shape({
    useValidators: PropTypes.func.isRequired,
  }).isRequired,
  validators: PropTypes.arrayOf(PropTypes.shape).isRequired,
  id: PropTypes.number.isRequired,
  layoutType: PropTypes.number.isRequired,
  title: PropTypes.string,
  instructions: PropTypes.string,
  image: PropTypes.string,
  feedback: PropTypes.string,
  onCompleted: PropTypes.func.isRequired,
  onDisplayImage: PropTypes.func.isRequired,
};

export default TutorialExecutionTask;
