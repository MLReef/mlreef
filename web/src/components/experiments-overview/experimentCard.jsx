import React from 'react';
import {
  string, number, arrayOf, shape,
} from 'prop-types';
import { Link } from 'react-router-dom';
import './experimentsOverview.css';
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
    algorithms,
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
        const expSlug = experiment.processing.slug;
        const codeProjectId = algorithms
          .filter((algo) => algo.slug === expSlug)
          .map((cd) => cd.code_project_id)[0];
        const {
          dataProjectId,
          slug,
        } = experiment;
        const shortSlug = slug ? slug.slice(11, slug.length) : '';
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
            <ExperimentSummary
              experiment={experiment}
              projectId={projectId}
              dataProjectId={dataProjectId}
              codeProjectId={codeProjectId}
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
