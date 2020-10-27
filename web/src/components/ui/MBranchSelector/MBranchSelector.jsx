import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import MDropdown from 'components/ui/MDropdown';
import './MBranchSelector.scss';

const MBranchSelector = (props) => {
  const {
    branches,
    activeBranch,
    className,
    onBranchSelected,
  } = props;

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
                {branches.filter((branch) => !branch.name.startsWith('data-pipeline')
                  && !branch.name.startsWith('experiment'))
                  .map((branch, index) => (
                    <li
                      tabIndex="0"
                      role="button"
                      key={index.toString()}
                      value={branch.name}
                      onClick={() => onBranchSelected(branch.name)}
                      onKeyDown={() => {}}
                    >
                      <p>{branch.name}</p>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
          <hr />
          <div className="search-branch">
            <div className="branches">
              <ul>
                <p className="branch-header">
                  Datasets
                </p>
                {branches.filter((branch) => branch.name.startsWith('data-pipeline')).reverse()
                  .map((branch) => {
                    const pipelineName = branch.name;
                    const uniqueName = pipelineName.split('/')[1];

                    return (
                      <li
                        key={`b-${branch.name}`}
                        role="button"
                        onKeyDown={() => {}}
                        onClick={() => {}}
                      >
                        <p>
                          {`${uniqueName} - ${(branch.commit.created_at)}`}
                        </p>
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>
        </div>
      )}
    />
  );
};

MBranchSelector.defaultProps = {
  branches: [],
  activeBranch: null,
  className: '',
};

MBranchSelector.propTypes = {
  branches: PropTypes.arrayOf(PropTypes.shape({

  })),
  activeBranch: PropTypes.string,
  className: PropTypes.string,
};

export default MBranchSelector;
