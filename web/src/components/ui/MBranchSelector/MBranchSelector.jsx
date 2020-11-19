import React from 'react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import cx from 'classnames';
import MDropdown from 'components/ui/MDropdown';
import './MBranchSelector.scss';

const MBranchSelector = (props) => {
  const {
    branches,
    activeBranch,
    className,
    showDatasets,
    showVisualizations,
    showExperiments,
    onBranchSelected,
  } = props;

  const displayBranchesForPipeline = (pipelineDisplayName, branchType) => {
    const filteredPipeBranches = branches.filter(
      (branch) => branch.name.startsWith(branchType),
    ).reverse();
    if (filteredPipeBranches.length > 0) {
      return (
        <div className="branches">
          <ul>
            <p className="branch-header">
              {pipelineDisplayName}
            </p>
            {filteredPipeBranches
              .map((branch) => {
                const pipelineName = branch.name;
                const uniqueName = pipelineName.split('/')[1];
                return (
                  <li
                    key={`b-${branch.name}`}
                    className="pl-3"
                    role="button"
                    onClick={() => onBranchSelected(branch.name)}
                  >
                    {`${uniqueName} - ${dayjs(branch.commit.created_at).format('HH:mm')}`}
                  </li>
                );
              })}
          </ul>
        </div>
      );
    }

    return null;
  };

  return (
    <MDropdown
      className={cx('m-branch-selector', className)}
      label={activeBranch || 'Select branch'}
      component={(
        <div className="select-branch">
          <div className="switch-header">
            <p>Switch Branches</p>
          </div>
          <hr />
          <div className="search-branch">
            <div className="branches">
              <ul>
                <p className="branch-header">Branches</p>
                {branches && branches.filter((branch) => !branch.name.startsWith('data-pipeline')
                  && !branch.name.startsWith('experiment') && !branch.name.startsWith('data-visualization'))
                  .map((branch, index) => (
                    <li
                      tabIndex="0"
                      role="button"
                      className="pl-3"
                      key={index.toString()}
                      value={branch.name}
                      onClick={() => onBranchSelected(branch.name)}
                      onKeyDown={() => {}}
                    >
                      {branch.name}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
          <hr />
          {showDatasets && (
          <div className="search-branch">
            {displayBranchesForPipeline('Datasets', 'data-pipeline')}
          </div>
          )}
          {showVisualizations && (
          <div className="search-branch">
            {displayBranchesForPipeline('Data visualizations', 'data-visualization')}
          </div>
          )}
          {showExperiments && (
          <div className="search-branch">
            {displayBranchesForPipeline('Experiments', 'experiment')}
          </div>
          )}
        </div>
      )}
    />
  );
};

MBranchSelector.defaultProps = {
  branches: [],
  activeBranch: null,
  className: '',
  showDatasets: false,
  showExperiments: false,
  showVisualizations: false,
};

MBranchSelector.propTypes = {
  branches: PropTypes.arrayOf(PropTypes.shape({})),
  showDatasets: PropTypes.bool,
  showExperiments: PropTypes.bool,
  showVisualizations: PropTypes.bool,
  activeBranch: PropTypes.string,
  className: PropTypes.string,
};

export default MBranchSelector;
