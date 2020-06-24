import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import './experimentsOverview.css';
import {
  getTimeCreatedAgo,
} from '../../functions/dataParserHelpers';
import SummarizedDataAndChartComp from './summarizedDataAndChartComp';
import { string, number, arrayOf, shape } from 'prop-types';

const ExperimentCard = (props) => {
  const {
    experiments,
    currentState,
    defaultBranch,
    projectId,
    algorithms,
  } = props;
  const today = new Date();
  return experiments.length > 0 ? (
    <div className="pipeline-card" key={today}>
      <div className="header mb-1">
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
        const modelTitle = experiment.processing.name;
        const allParameters = algorithms.filter((algo) => algo.name === modelTitle)[0].parameters;
        const {
          id, processing: { parameters },
          dataProjectId,
          pipelineJobInfo: pipelineInfo,
          slug,
        } = experiment;
        const shortSlug = slug ? slug.slice(11, slug.length) : "";
        return (
          <div
            key={experiment.name}
            className="card-content py-2"
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
                  <b>{shortSlug}</b>
                </Link>
                <p style={{ margin: '0' }} id="time-created-ago">
                  Created by
                  &nbsp;
                  <b>
                    <a href={`/${experiment.authorName}`}>
                      {experiment.authorName}
                    </a>
                  </b>
                  {' '}
                  {getTimeCreatedAgo(experiment.pipelineJobInfo.createdAt, today)}
                    &nbsp;
                  ago
                </p>
              </div>
              <div className="project-desc-experiment">
                <p>
                  Model:
                  {' '}
                  <b>{modelTitle}</b>
                </p>
              </div>
            </div>
            <SummarizedDataAndChartComp
              experiment={experiment}
              projectId={projectId}
              defaultBranch={defaultBranch}
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
  experiments: arrayOf(shape({
    name: string.isRequired,
    authorName: string.isRequired,
    pipelineJobInfo: shape({
      createdAt: string.isRequired
    }),
    processing: shape({
      parameters: arrayOf(shape({
        name: string.isRequired,
        value: string.isRequired,
      })),
    }),
  })),
  currentState: string.isRequired,
  defaultBranch: string.isRequired,
  projectId: number.isRequired,
  algorithms: arrayOf(shape({
    name: string.isRequired,
  })),
};

function mapStateToProps(state) {
  return {
    algorithms: state.processors.algorithms,
  };
}

export default connect(mapStateToProps)(ExperimentCard);
