import React from 'react';
import {
  arrayOf, func, shape, string,
} from 'prop-types';
import MDataFilters from 'components/ui/MDataFilters';
import MBricksWall from 'components/ui/MBricksWall';
import EnvironmentCard from '../EnvironmentCard/EnvironmentCard';
import { filters } from '../info2';

const SelectBaseEnv = ({
  operationType,
  namespace,
  slug,
  environments,
  selectedEnv,
  selectedBranch,
  dispatch,
  history,
}) => (
  <div className="row" style={{ minHeight: '60vh' }}>
    <div className="col-3" />
    <div className="col-6">
      <div className="statement">
        <div className="statement-title">
          Select a base environment for your model
        </div>
        <div className="statement-subtitle">
          MLReef provides a set of base environment images including
          a set of pre-installed packages. Select one, that works best
          with your code!
        </div>
      </div>
      <MBricksWall
        animated
        bricks={
          environments.map((env) => (
            <EnvironmentCard
              dispatch={dispatch}
              environment={env}
              isSelected={selectedEnv === env}
            />
          ))
        }
      />
    </div>
    <div className="col-3 pl-3">
      <div className="publishing-view-summary">
        <div className="parameter mb-3">
          <span className="parameter-key">
            Selected:
          </span>
          <strong className="parameter-value t-info">
            {selectedEnv ? selectedEnv.title : 'No base environment selected'}
          </strong>
        </div>
        <button
          type="button"
          className="btn btn-dark"
          disabled={!selectedEnv}
          onClick={() => history.push(`/${namespace}/${slug}/-/publishing/branch/${selectedBranch}/#publish-${operationType.toLowerCase()}`)}
        >
          Continue
        </button>
      </div>
      <MDataFilters filters={filters} />
    </div>
  </div>
);

SelectBaseEnv.propTypes = {
  namespace: string.isRequired,
  slug: string.isRequired,
  environments: arrayOf(shape({})).isRequired,
  selectedEnv: shape({}),
  dispatch: func.isRequired,
  history: shape({ push: func }).isRequired,
};

SelectBaseEnv.defaultProps = {
  selectedEnv: null,
};

export default SelectBaseEnv;
