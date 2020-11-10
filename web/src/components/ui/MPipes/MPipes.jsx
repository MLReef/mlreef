import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import './MPipes.scss';

const MPipes = (props) => {
  const {
    stages,
    status,
    className,
    setSelectedJob,
  } = props;

  const calcPipes = useCallback(
    (jobs, index, len) => {
      const unique = len === 1 && 'unique';
      const first = index === 0 && 'first';
      const last = len === index + 1 && 'last';

      return cx('line', unique || last || first || 'middle');
    },
    [],
  );

  return (
    <div className={cx('m-pipes', className)}>
      <div className="m-pipes-container">
        {stages.map((stage, iStage) => (
          <div key={`stage-${stage.label}`} className="m-pipes-stage">
            <div className="m-pipes-stage-label">
              {stage.label}
            </div>
            <div className="m-pipes-stage-container">
              <div className="m-pipes-stage-jobs">
                {stage.jobs.map((job) => (
                  <div
                    style={{ cursor: 'pointer' }}
                    key={`job-${job.name}`}
                    className={cx(
                      'm-pipes-stage-jobs-job border-rounded',
                      `status-${job.status}`,
                    )}
                    onClick={() => setSelectedJob(job)}
                  >
                    <img
                      className="icon"
                      src={`/images/status/${job.status}.svg`}
                      alt="status"
                    />
                    <span className="label my-auto">
                      {job.name}
                    </span>
                  </div>
                ))}
              </div>
              <div className="m-pipes-stage-separator">
                {stage.jobs.map((job, iJob) => (
                  <div
                    key={`sep-${job.name}`}
                    className={calcPipes(job, iJob, stage.jobs.length)}
                  >
                    {iStage === stages.length - 1 && iJob === 0 && (
                      <span className="end" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        <div className="m-pipes-status">
          <div className="m-pipes-status-label">
            Status
          </div>
          <div className={cx('m-pipes-status-value', status)}>
            {status}
          </div>
        </div>
      </div>
    </div>
  );
};

MPipes.defaultProps = {
  className: '',
};

const statusModel = [
  'pending',
  'running',
  'success',
  'warning',
  'failed',
];

const stageModel = {
  label: PropTypes.string.isRequired,
  jobs: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    status: PropTypes.oneOf(statusModel),
  })).isRequired,
};

MPipes.propTypes = {
  stages: PropTypes.arrayOf(PropTypes.shape(stageModel)).isRequired,
  status: PropTypes.oneOf(statusModel).isRequired,
  className: PropTypes.string,
};

export default MPipes;
