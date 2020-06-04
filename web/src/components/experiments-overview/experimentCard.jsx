import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  string,
  arrayOf,
  shape,
  number,
} from 'prop-types';
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
    algorithms,
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
        const allParameters = algorithms.filter((algo) => algo.name === experiment.modelTitle)[0].parameters;
        const {
          experimentData: {
            id, processing: { parameters },
            data_project_id: dataProjectId,
            pipeline_job_info: pipelineInfo,
          },
        } = experiment;
        return (
          <div
            key={`${experiment.timeCreatedAgo}-${experiment.descTitle}`}
            className="card-content"
          >
            <div className="summary-data" style={{ width: 'auto' }}>
              <div className="project-desc-experiment pt-1">
                <Link
                  type="button"
                  to={{
                    pathname: `/my-projects/${projectId}/-/experiments/${pipelineInfo.id}`,
                    state: {
                      uuid: dataProjectId,
                      currentState,
                      userParameters: parameters,
                      pipelineInfo,
                      experimentId: id,
                      allParameters,
                    },
                  }}
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    marginTop: 7,
                    padding: 0,
                  }}
                >
                  <b>{uniqueName}</b>
                </Link>
                <p style={{ margin: '0' }} id="time-created-ago">
                  Created by
                  &nbsp;
                  <b>
                    <a href={`/${experiment.userName}`}>
                      {experiment.userName}
                    </a>
                  </b>
                  {' '}
                  {getTimeCreatedAgo(experiment.timeCreatedAgo, today)}
                    &nbsp;
                  ago
                </p>
              </div>
              {!experiment.modelTitle && (
                <div className="project-desc-experiment">
                  <p>
                    <b>
                      {experiment.percentProgress}
                      % completed
                    </b>
                  </p>
                </div>
              )}
              {!experiment.percentProgress && (
                <div className="project-desc-experiment">
                  <p>
                    Model:
                    {' '}
                    <b>{experiment.modelTitle}</b>
                  </p>
                </div>
              )}
            </div>
            <SummarizedDataAndChartComp
              experiment={experiment}
              projectId={projectId}
              defaultBranch={defaultBranch}
              userParameters={parameters}
            />
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
};

function mapStateToProps(state) {
  return {
    algorithms: state.processors.algorithms,
  };
}

export default connect(mapStateToProps)(ExperimentCard);
