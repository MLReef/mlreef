import React from 'react';
import { toastr } from 'react-redux-toastr';
import DataInstanteDeleteModal from 'components/DeleteDataInstance/DeleteDatainstance';
import {
  CANCELED, FAILED, PENDING, RUNNING, SUCCESS,
} from 'dataTypes';
import { Link } from 'router';
import { getPipelineIcon, getInfoFromStatus } from 'functions/pipeLinesHelpers';
import DataInstanceActions from './DataInstanceActions';

const DataInstancesCard = (props) => {
  const {
    params,
    history,
    namespace,
    slug,
    fetchPipelines,
    fireModal,
  } = props;
  
  const { statusTitle } = getInfoFromStatus(params?.currentState);

  function getButtonsDiv(instance) {
    let buttons;
    const { currentState } = instance;
    if (currentState === RUNNING || currentState === PENDING) {
      buttons = [
        <button
          type="button"
          key="abort-button"
          className="btn btn-danger border-solid my-auto"
          style={{ width: 'max-content' }}
          onClick={() => {
            fireModal({
              title: `Abort ${instance.descTitle}`,
              type: 'danger',
              closable: true,
              content: <DataInstanteDeleteModal dataInstanceName={instance.descTitle} />,
              onPositive: () => DataInstanceActions.abortDataInstance(
                instance.projId,
                instance.pipelineBackendId,
                instance.backendInstanceId,
                instance.id,
              )
                .then(fetchPipelines)
                .then(() => toastr.success('Success', 'The data instace was aborted'))
                .catch((err) => toastr.error('Error', err?.message)),
            });
          }}
        >
          Abort
        </button>,
      ];
    } else if (
      currentState === SUCCESS
    ) {
      buttons = [
        <button
          type="button"
          key="experiment-button"
          className="btn btn-outline-dark my-auto mr-1"
          onClick={() => history.push(`/${namespace}/${slug}/-/datasets/${instance?.pipelineBackendId}/rebuild`)}
        >
          View Pipeline
        </button>,
        <button
          type="button"
          key="delete-button"
          onClick={
              () => {
                fireModal({
                  title: `Delete ${instance.descTitle}`,
                  type: 'danger',
                  closable: true,
                  content: <DataInstanteDeleteModal dataInstanceName={instance.descTitle} />,
                  onPositive: () => {
                    DataInstanceActions.deleteDataInstance(
                      instance.pipelineBackendId,
                      instance.backendInstanceId,
                    )
                      .then(fetchPipelines)
                      .then(() => toastr.success('Success', 'Pipeline was deleted'))
                      .catch((error) => toastr.error('Error', error?.message));
                  },
                });
              }
            }
          className="btn btn-danger btn-icon my-auto"
        >
          <i className="fa fa-times" />
        </button>,
      ];
    } else if (currentState === FAILED
        || currentState === CANCELED) {
      buttons = [
        <button
          type="button"
          key="experiment-button"
          className="btn btn-outline-dark my-auto mr-1"
          onClick={() => history.push(`/${namespace}/${slug}/-/datasets/${instance?.pipelineBackendId}/rebuild`)}
        >
          View Pipeline
        </button>,
        <button
          type="button"
          key="delete-button"
          className="btn btn-danger btn-icon my-auto"
          onClick={() => {
            fireModal({
              title: `Delete ${instance.descTitle}`,
              type: 'danger',
              closable: true,
              content: <DataInstanteDeleteModal dataInstanceName={instance.descTitle} />,
              onPositive: () => {
                DataInstanceActions.deleteDataInstance(
                  instance.pipelineBackendId,
                  instance.backendInstanceId,
                )
                  .then(fetchPipelines)
                  .then(() => toastr.success('Success', 'Pipeline was deleted'))
                  .catch((error) => toastr.error('Error', error?.message));
              },
            });
          }}
        >
          <i className="fa fa-times" />
        </button>,
      ];
    }

    return (
      <div className="buttons-div d-flex">{buttons}</div>
    );
  }
  return (
    <div className="pipeline-card">
      <div className="header">
        <div className="title-div">
          <p><b>{statusTitle}</b></p>
        </div>
      </div>

      {params?.instances?.map((instance) => {
        const {
          id: dataId, pipelineBackendId, userName, currentState,
        } = instance;
        const dataInstanceName = instance.descTitle;
        const uniqueName = dataInstanceName.split('/')[1];
        const modelDiv = 'inherit';
        let progressVisibility = 'inherit';
        if (currentState === 'Expired') { progressVisibility = 'hidden'; }
        return (
          <div key={`instance-comp-id-${instance.id}`} className="card-content">
            <div id="data-ins-summary-data" className="summary-data" data-key={`${instance.descTitle}`}>
              <img style={{ alignSelf: 'center' }} src={getPipelineIcon(currentState)} width="30" height="30" alt={currentState} />
              <div className="project-desc-experiment">
                <Link to={`/${namespace}/${slug}/-/datasets/${pipelineBackendId}`}>
                  <b>{uniqueName}</b>
                </Link>
                <p className="m-0 mt-1">
                  Created by
                  {' '}
                  <a href={`/${userName}`}>
                    <b>
                      {userName}
                    </b>
                  </a>
                  <br />
                  {instance.timeCreatedAgo}
                  {' '}
                  ago
                </p>
              </div>
              <div className="project-desc-experiment" style={{ visibility: progressVisibility }}>
                <p><b>Usage: ---</b></p>
              </div>
              <div className="project-desc-experiment d-flex" style={{ visibility: modelDiv }}>
                <p style={{ flex: '1' }}>
                  Id:
                  {' '}
                  {dataId}
                </p>
                { getButtonsDiv(instance) }
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DataInstancesCard;
