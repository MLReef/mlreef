import React from 'react';
import {
  string,
  arrayOf,
  shape,
  number,
  func,
} from 'prop-types';
import "../../css/globalStyles.css";
import './experimentsOverview.css';
import {
  getTimeCreatedAgo,
} from '../../functions/dataParserHelpers';
import SummarizedDataAndChartComp from './summarizedDataAndChartComp';

const ExperimentCard = (props) => {
  const {
    params: {
      experiments,
      currentState,
      defaultBranch,
      projectId,
    },
    setSelectedExperiment,
  } = props;
  const today = new Date();
  
  return experiments.length > 0 ? (
    <div className="pipeline-card" key={today}>
      <div className="header">
        <div className="title-div">
          <p><b>{currentState}</b></p>
        </div>
        <div className="select-div">
          <select>
            <option value="">Sort by</option>
          </select>
        </div>
      </div>

      {experiments.map((experiment) => {
        const experimentName = experiment.descTitle;
        const uniqueName = experimentName.split('/')[1];
        let modelDiv = 'inherit';
        let progressVisibility = 'inherit';
        if (!experiment.percentProgress) {
          modelDiv = 'hidden';
        }
        if (!experiment.modelTitle) {
          progressVisibility = 'hidden';
        }
        return (
          <div
            key={`${experiment.timeCreatedAgo}-${experiment.descTitle}`}
            className="card-content"
          >
            <div className="summary-data" style={{width: '80%'}}>
              <div className="project-desc-experiment">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedExperiment(experiment);
                  }}
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    marginTop: 7,
                    padding: 0,
                  }}
                >
                  <b>{uniqueName}</b>
                </button>
                <p id="time-created-ago">
                    Created by 
                    &nbsp;
                  <b>{experiment.userName}</b>
                  <br />
                  {getTimeCreatedAgo(experiment.timeCreatedAgo, today)}
                    &nbsp;
                  ago
                </p>
              </div>
              <div className="project-desc-experiment" style={{ visibility: progressVisibility }}>
                <p>
                  <b>
                    {experiment.percentProgress}
                      % completed
                  </b>
                </p>
              </div>
              <div className="project-desc-experiment" style={{ visibility: modelDiv }}>
                <p>
                    Model:
                  {' '}
                  <b>{experiment.modelTitle}</b>
                </p>
              </div>
            </div>
            <SummarizedDataAndChartComp experiment={experiment} projectId={projectId} defaultBranch={defaultBranch} />
          </div>
        );
      })}
    </div>
  ) : (
    null
  );
};

ExperimentCard.propTypes = {
  params: shape({
    currentState: string.isRequired,
    experiments: arrayOf(
      shape({
        currentState: string,
        descTitle: string,
        userName: string,
        percentProgress: string,
        eta: string,
        modelTitle: string,
        timeCreatedAgo: string,
      }),
    ).isRequired,
    projectId: number.isRequired,
  }).isRequired,
  setSelectedExperiment: func.isRequired,
};

export default ExperimentCard;
