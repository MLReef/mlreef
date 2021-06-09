import React from 'react';
import {
  func, string, arrayOf, shape,
} from 'prop-types';
import { Link } from 'react-router-dom';
import {
  RUNNING,
  SUCCESS,
  CANCELED,
  FAILED,
  PENDING,
} from 'dataTypes';
import { toastr } from 'react-redux-toastr';
import { useHistory } from 'router';
import hooks from 'customHooks/useSelectedProject';
import DataInstanteDeleteModal from 'components/DeleteDataInstance/DeleteDatainstance';
import ACCESS_LEVEL from 'domain/accessLevels';
import AuthWrapper from 'components/AuthWrapper';
import { getPipelineIcon, getInfoFromStatus } from 'functions/pipeLinesHelpers';
import { getTimeCreatedAgo } from 'functions/dataParserHelpers';
import DataInstanceActions from '../Datainstances/DataInstanceActions';
import './dataVisualizationCard.scss';

const DataVisualizationCard = ({
  classification,
  namespace,
  slug,
  callback,
  fireModal,
}) => {
  const history = useHistory();
  const today = new Date();
  const { statusTitle } = getInfoFromStatus(classification?.status);
  const [selectedProject] = hooks.useSelectedProject(namespace, slug);
  const { gid } = selectedProject;

  function getButtonsDiv(dataVisualizationState, val) {
    let buttons;
    if (dataVisualizationState === RUNNING || dataVisualizationState === PENDING) {
      buttons = [
        <AuthWrapper minRole={ACCESS_LEVEL.DEVELOPER}>
          <button
            type="button"
            key="abort-button"
            className="btn btn-danger border-solid my-auto"
            style={{ width: 'max-content' }}
            onClick={() => {
              fireModal({
                title: `Abort ${val?.name}`,
                type: 'danger',
                closable: true,
                content: <DataInstanteDeleteModal dataInstanceName={val?.name} />,
                onPositive: () => {
                  DataInstanceActions.abortDataInstance(
                    gid,
                    val?.backendPipeline?.id,
                    val?.backendPipeline?.instances[0]?.id,
                    val?.backendPipeline?.instances[0]?.pipeline_job_info?.id,
                  )
                    .then(() => callback())
                    .then(() => toastr.success('Success', 'Pipeline was deleted'))
                    .catch((error) => toastr.error('Error', error?.message || 'Please try in a minute, your job has not been generated yet.'));
                },
              });
            }}
          >
            Abort
          </button>
        </AuthWrapper>,
      ];
    } else if (dataVisualizationState === FAILED
      || dataVisualizationState === CANCELED
      || dataVisualizationState === SUCCESS) {
      buttons = [
        <button
          type="button"
          key="experiment-button"
          className="btn btn-outline-dark my-auto mr-1"
          onClick={() => history.push(`/${namespace}/${slug}/-/visualizations/${val?.backendPipeline?.id}/rebuild`)}
        >
          View Pipeline
        </button>,
        <AuthWrapper key="delete-button" minRole={30}>
          <button
            type="button"
            className="btn btn-danger btn-icon my-auto"
            onClick={() => {
              fireModal({
                title: `Delete ${val?.name}`,
                type: 'danger',
                closable: true,
                content: <DataInstanteDeleteModal dataInstanceName={val?.name} />,
                onPositive: () => DataInstanceActions.deleteDataInstance(
                  val?.backendPipeline?.id,
                  val?.backendPipeline?.instances[0]?.id,
                )
                  .then(() => callback())
                  .then(() => toastr.success('Success', 'Pipeline was deleted'))
                  .catch((error) => toastr.error('Error', error?.message || 'Please try in a minute, your job has not been generated yet.')),
              });
            }}
          >
            <i className="fa fa-times" />
          </button>
        </AuthWrapper>,
      ];
    }

    return buttons;
  }

  return (
    <div className="pipeline-card" key={today}>
      <div className="header">
        <div className="title-div">
          <p><b>{statusTitle}</b></p>
        </div>
      </div>
      {classification.values.map((val) => {
        const pipeBackendId = val?.backendPipeline?.id;
        const uniqueName = val?.name?.split('/')[1];
        return (
          <div className="data-visualization-card-content" key={`${val.creator} ${val.name}`} data-key={val.name}>
            <img src={getPipelineIcon(val.status)} width="30" height="30" alt={val.status} />
            <div className="general-information ml-2">
              <Link to={`/${namespace}/${slug}/-/visualizations/${pipeBackendId}`}>
                <b>{uniqueName}</b>
              </Link>
              <p className="m-0 mt-1">
                Created by
                {' '}
                <a href={`/${val?.authorName}`}>
                  <b>
                    {val?.authorName}
                  </b>
                </a>
                {' '}
                {getTimeCreatedAgo(val.createdAt, new Date())}
                &nbsp;
                ago
              </p>
            </div>
            {getButtonsDiv(classification.status, val)}
          </div>
        );
      })}
    </div>
  );
};

DataVisualizationCard.propTypes = {
  classification: shape({
    status: string.isRequired,
    values: arrayOf(shape({
      creator: string,
      name: string.isRequired,
      authorName: string.isRequired,
      createdAt: string.isRequired,
      completedPercentage: string,
      spaceUsed: string,
      expiresIn: string,
      filesChanged: string,
    })).isRequired,
  }).isRequired,
  namespace: string.isRequired,
  slug: string.isRequired,
  callback: func.isRequired,
};

export default DataVisualizationCard;
