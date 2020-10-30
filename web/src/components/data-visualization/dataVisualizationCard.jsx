import React, { useState } from 'react';
import {
  func, string, arrayOf, shape,
} from 'prop-types';
import { Redirect, Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  RUNNING,
  SUCCESS,
  CANCELED,
  FAILED,
  PENDING,
} from 'dataTypes';
import { toastr } from 'react-redux-toastr';
import { closeModal, fireModal } from 'actions/actionModalActions';
import DataInstanteDeleteModal from 'components/DeleteDataInstance/DeleteDatainstance';
import AuthWrapper from 'components/AuthWrapper';
import { setPreconfiguredOPerations } from 'actions/userActions';
import { getPipelineIcon, getInfoFromStatus } from 'functions/pipeLinesHelpers';
import { getTimeCreatedAgo } from 'functions/dataParserHelpers';
import DataInstanceActions from '../data-instance/DataInstanceActions';
import './dataVisualizationCard.css';

const DataVisualizationCard = (
  {
    classification,
    namespace,
    slug,
    setPreconfOps,
    callback,
    fireModal,
  },
) => {
  const today = new Date();
  const [redirect, setRedirect] = useState(false);
  const { statusTitle } = getInfoFromStatus(classification?.status);

  function goToPipelineView(val) {
    const {
      data_operations: dataOperations,
      input_files: inputFiles,
      id,
    } = val?.backendPipeline;
    const configuredOperations = {
      dataOperatorsExecuted: dataOperations,
      inputFiles,
      id,
    };
    setPreconfOps(configuredOperations);
    setRedirect(true);
  }

  function getButtonsDiv(dataVisualizationState, val) {
    let buttons;
    if (dataVisualizationState === RUNNING || dataVisualizationState === PENDING) {
      buttons = [
        <AuthWrapper minRole={30}>
          <button
            type="button"
            key="abort-button"
            className="btn btn-danger border-solid my-auto"
            style={{ width: 'max-content' }}
            onClick={() => {
              fireModal({
                title: `Delete ${val?.name}`,
                type: 'danger',
                closable: true,
                content: <DataInstanteDeleteModal dataInstanceName={val?.name} />,
                onPositive: () => {
                  DataInstanceActions.deleteDataInstance(
                    val?.pipelineBackendId,
                    val?.backendInstanceId,
                  )
                    .then(callback)
                    .then(() => toastr.success('Success', 'Pipeline was deleted'))
                    .catch((error) => toastr.error('Error', error?.message));
                },
              });
            }}
          >
            Abort
          </button>
        </AuthWrapper>,
      ];
    } else if (
      dataVisualizationState === SUCCESS
    ) {
      buttons = [
        <button
          type="button"
          key="experiment-button"
          className="btn btn-outline-dark my-auto mr-1"
          onClick={() => goToPipelineView(val)}
        >
          View Pipeline
        </button>,
        <AuthWrapper minRole={30}>
          <button
            type="button"
            key="delete-button"
            onClick={() => {
              fireModal({
                title: `Delete ${val?.name}`,
                type: 'danger',
                closable: true,
                content: <DataInstanteDeleteModal dataInstanceName={val?.name} />,
                onPositive: () => {
                  DataInstanceActions.deleteDataInstance(
                    val?.pipelineBackendId,
                    val?.backendInstanceId,
                  )
                    .then(callback)
                    .then(() => toastr.success('Success', 'Pipeline was deleted'))
                    .catch((error) => toastr.error('Error', error?.message));
                },
              });
            }}
            className="btn btn-danger btn-icon my-auto"
          >
            <i className="fa fa-times" />
          </button>
        </AuthWrapper>,
      ];
    } else if (dataVisualizationState === FAILED
      || dataVisualizationState === CANCELED) {
      buttons = [
        <button
          type="button"
          key="experiment-button"
          className="btn btn-outline-dark my-auto mr-1"
          onClick={() => goToPipelineView(val)}
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
                onPositive: () => {
                  DataInstanceActions.deleteDataInstance(
                    val?.pipelineBackendId,
                    val?.backendInstanceId,
                  )
                    .then(callback)
                    .then(() => toastr.success('Success', 'Pipeline was deleted'))
                    .catch((error) => toastr.error('Error', error?.message));
                },
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

  if (redirect) {
    return <Redirect to={`/${namespace}/${slug}/-/visualizations/new`} />;
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
  setPreconfOps: func.isRequired,
  namespace: string.isRequired,
  slug: string.isRequired,
  callback: func.isRequired,
};

function mapActionsToProps(dispatch) {
  return {
    setPreconfOps: bindActionCreators(setPreconfiguredOPerations, dispatch),
    fireModal: bindActionCreators(fireModal, dispatch),
    closeModal: bindActionCreators(closeModal, dispatch),
  };
}

export default connect(null, mapActionsToProps)(DataVisualizationCard);
