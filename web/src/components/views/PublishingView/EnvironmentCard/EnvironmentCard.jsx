import {
  arrayOf, bool, func, shape, string,
} from 'prop-types';
import React from 'react';
import './EnvironmentCard.scss';

export function processRequirementsFile(stringRequirements) {
  if (!stringRequirements?.includes('\n')) {
    return [];
  }

  return stringRequirements.split('\n');
}

const EnvironmentCard = ({ dispatch, environment, isSelected }) => (
  <div
    className="card environment-card"
    onClick={() => dispatch({ type: 'SET_ENVIRONMENT', payload: environment })}
  >
    <div className={`card-container environment-card-container ${isSelected ? 'selected' : ''}`}>
      <p className="card-title" style={{ paddingBottom: '0px', margin: 0 }}>
        {environment.title}
      </p>
      <p className="environments-title">The environment includes:</p>
      <div className="card-content environment-card-container-content">
        <ul>
          {processRequirementsFile(environment.requirements).map((req) => (
            <li key={req}><p>{req}</p></li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

EnvironmentCard.propTypes = {
  dispatch: func.isRequired,
  environment: shape({
    name: string.isRequired,
    requirements: arrayOf(string),
  }).isRequired,
  isSelected: bool,
};

EnvironmentCard.defaultProps = {
  isSelected: false,
};

export default EnvironmentCard;
