import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import './MVerticalSteps.scss';

const MVerticalSteps = (props) => {
  const {
    className,
    steps,
  } = props;

  return (
    <div className={cx('m-vertical-steps', className)}>
      {steps.map((step, index) => (
        <div key={`steps-${index}`} className="m-vertical-steps-step">
          <div className="m-vertical-steps-step-marker">
            <div className={cx('label-ordinal', { done: step.done })}>
              <span className="label-ordinal-number">
                {index + 1}
              </span>
            </div>
          </div>
          <div className="m-vertical-steps-step-content">
            {step.label && (
              <h5 className="m-vertical-steps-step-content-title">
                {step.label}
              </h5>
            )}
            {step.content}
          </div>
        </div>
      ))}
    </div>
  );
};

MVerticalSteps.defaultProps = {
  className: '',
};

MVerticalSteps.propTypes = {
  className: PropTypes.string,
  steps: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    content: PropTypes.node.isRequired,
    done: PropTypes.bool,
  })).isRequired,
};

export default MVerticalSteps;
