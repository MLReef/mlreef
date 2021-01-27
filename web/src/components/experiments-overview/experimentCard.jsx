import React from 'react';
import {
  string, number, arrayOf, shape,
} from 'prop-types';
import { Link } from 'react-router-dom';
import './experimentsOverview.css';
import { getPipelineIcon } from 'functions/pipeLinesHelpers';
import {
  getTimeCreatedAgo,
} from '../../functions/dataParserHelpers';
import ExperimentSummary from './ExperimentSummary';

const ExperimentCard = (props) => {
  const {
    projectNamespace,
    projectSlug,
    experiments,
    currentState,
    projectId,
  } = props;
  const today = new Date();
  return (
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
        const {
          dataProjectId,
          slug,
        } = experiment;
        const shortSlug = slug ? slug.slice(11, slug.length) : '';
        return (
          <div
            key={experiment.name}
            className="card-content p-3"
          >
            <div className="summary-data" style={{ width: 'auto' }}>
              <img style={{ alignSelf: 'center' }} src={getPipelineIcon(currentState)} width="30" height="30" alt={currentState} />
              <div className="project-desc-experiment pt-1">
                <Link
                  type="button"
                  to={{
                    pathname: `/${projectNamespace}/${projectSlug}/-/experiments/${experiment.id}`,
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
                <p className="m-0">
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
                <p className="m-0">
                  Model:
                  {' '}
                  <b>{modelTitle}</b>
                </p>
              </div>
            </div>
            <ExperimentSummary
              experiment={experiment}
              projectId={projectId}
              projectNamespace={projectNamespace}
              projectSlug={projectSlug}
              dataProjectId={dataProjectId}
            />
          </div>
        );
      })}
    </div>
  );
};

ExperimentCard.propTypes = {
  experiments: arrayOf(shape({
    name: string.isRequired,
    authorName: string.isRequired,
    pipelineJobInfo: shape({
      createdAt: string.isRequired,
    }),
    processing: shape({
      parameters: arrayOf(shape({
        name: string.isRequired,
        value: string.isRequired,
      })),
    }),
  })),
  currentState: string.isRequired,
  projectId: number.isRequired,
  algorithms: arrayOf(shape({
    name: string.isRequired,
  })).isRequired,
};

ExperimentCard.defaultProps = {
  experiments: [],
};

export default ExperimentCard;
