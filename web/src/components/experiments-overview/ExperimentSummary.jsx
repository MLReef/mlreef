import React, { useState, useEffect } from 'react';
import {
  string,
  shape,
  number,
  arrayOf,
} from 'prop-types';
import { toastr } from 'react-redux-toastr';
import './experimentsOverview.css';
import { Line } from 'react-chartjs-2';
import AuthWrapper from 'components/AuthWrapper';
import MModal from 'components/ui/MModal';
import GitlabPipelinesApi from 'apis/GitlabPipelinesApi.ts';
import ExperimentsApi from 'apis/experimentApi';
import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import DataCard from 'components/layout/DataCard';
import traiangle01 from '../../images/triangle-01.png';
import ArrowButton from '../arrow-button/arrowButton';
import {
  parseDecimal,
} from '../../functions/dataParserHelpers';
import {
  SKIPPED,
  RUNNING,
  SUCCESS,
  CANCELED,
  FAILED,
  PENDING,
} from '../../dataTypes';
import ExperimentCancellationModal from './cancellationModal';
import DeleteExperimentModal from './DeletionModal';

const gitlabApi = new GitlabPipelinesApi();
const experimentApi = new ExperimentsApi();
const projectInstance = new ProjectGeneralInfoApi();

const ExperimentSummary = ({
  projectId,
  dataProjectId,
  codeProjectId,
  projectNamespace,
  projectSlug,
  experiment,
}) => {
  const [showSummary, setShowSummary] = useState(false);
  const [dataToGraph, setDataToGraph] = useState({
    datasets: [],
    labels: [],
  });
  const {
    inputFiles,
    sourceBranch,
    id,
    jsonBlob,
    epochs,
    name,
    status,
    processing,
    pipelineJobInfo: { commitSha },
    slug: expName,
  } = experiment;

  const inputFilePath = inputFiles[0].location.toString();
  const basePath = `${projectNamespace}/${projectSlug}`;
  const [averageParams, setAverageParams] = useState([]);
  const [shouldAbortModalRender, setShouldAbortModalRender] = useState(false);
  const [shouldDeleteModalRender, setShouldDeleteModalRender] = useState(false);
  const [codeProject, setcodeProject] = useState({});
  const modelName = processing ? processing.name : '';
  const trainingData = processing.parameters ? processing.parameters.map((param) => (
    { text: `*P: ${param.name} = ${param.value}` }
  )) : [];

  useEffect(() => {
    projectInstance.getCodeProjectById(codeProjectId)
      .then((res) => setcodeProject(res));
  }, [codeProjectId]);

  const { gitlab_namespace: nameSpace, slug } = codeProject;
  const closeModal = () => setShouldAbortModalRender(false);
  const closeDeletionModal = () => setShouldDeleteModalRender(false);
  const linkToRepoView = `/${basePath}/-/repository/tree/-/commit/${commitSha}`;

  function abortClickHandler(pipelineId) {
    gitlabApi.abortGitlabPipelines(
      projectId,
      pipelineId,
    )
      .then(() => {
        experimentApi.cancelExperiment(dataProjectId, id);
        toastr.success('Success', 'Pipeline aborted');
        closeModal();
        window.location.reload();
      })
      .catch(() => toastr.error('Error', 'Error aborting pipeline'));
  }

  function deleteClickHandler(experimentId) {
    experimentApi.delete(dataProjectId, experimentId)
      .then(() => toastr.success('Success', 'Experiment deleted'))
      .catch(() => toastr.error('Error', 'Something failed deleting'))
      .finally(() => {
        closeDeletionModal();
        window.location.reload();
      });
  }

  function handleArrowDownButtonClick() {
    const newIsShowingSum = !showSummary;
    setShowSummary(newIsShowingSum);
    if (!newIsShowingSum) {
      return;
    }
    try {
      experiment.fromBlobToEpochs(jsonBlob);
      setAverageParams(experiment.generateAverageInformation());
      setDataToGraph({
        labels: Object.keys(epochs),
        datasets: experiment.generateChartInformation(),
      });
    } catch (error) {
      toastr.info('Experiment', error.message);
    }
  }

  function getButtonsDiv() {
    let buttons;
    const experimentStatus = status?.toLowerCase();

    const arrowBtn = (
      <ArrowButton
        imgPlaceHolder={traiangle01}
        callback={() => handleArrowDownButtonClick()}
        id={`ArrowButton-${expName}`}
        key={`ArrowButton-${expName}`}
      />
    );

    if (experimentStatus === RUNNING || experimentStatus === PENDING) {
      buttons = [
        <button
          key={`dangerous-red-${expName}`}
          type="button"
          className="btn btn-danger"
          style={{ width: 'max-content' }}
          onClick={() => setShouldAbortModalRender(true)}
        >
          Abort
        </button>,
      ];
    } else if (experimentStatus === SKIPPED) {
      buttons = [
        <button
          key={`dangerous-red-${expName}`}
          type="button"
          label="close"
          className="btn btn-icon btn-danger fa fa-times"
        />,
        <button
          key={`deploy-${expName}`}
          type="button"
          className="btn btn-primary"
        >
          Resume
        </button>,
      ];
    } else if (experimentStatus === SUCCESS || experimentStatus === FAILED) {
      buttons = [
        arrowBtn,
        <button
          key={`dangerous-red-${expName}`}
          type="button"
          label="close"
          className="btn btn-icon btn-danger fa fa-times"
          onClick={() => setShouldDeleteModalRender(!shouldDeleteModalRender)}
        />,
      ];
    } else if (experimentStatus === CANCELED) {
      buttons = [
        <button
          key={`dangerous-red-${expName}`}
          type="button"
          label="close"
          className="btn btn-icon btn-danger fa fa-times"
          onClick={() => setShouldDeleteModalRender(!shouldDeleteModalRender)}
        />,
      ];
    }

    return (
      <div className="buttons-div my-auto">
        {arrowBtn}
        <AuthWrapper minRole={30} norender>
          {buttons}
        </AuthWrapper>
      </div>
    );
  }

  return (
    <>
      {getButtonsDiv()}
      <MModal>
        <ExperimentCancellationModal
          experimentToAbort={experiment}
          shouldComponentRender={shouldAbortModalRender}
          abortClickHandler={abortClickHandler}
          closeModal={closeModal}
        />
      </MModal>
      <MModal>
        <DeleteExperimentModal
          experiment={experiment}
          shouldRender={shouldDeleteModalRender}
          handleCloseModal={closeDeletionModal}
          handleDeleteExp={deleteClickHandler}
        />
      </MModal>
      {showSummary && (
        <>
          <div key={`${name} ${experiment.status} data-summary`} className="data-summary">
            <div style={{ width: '100%', minWidth: 700, maxWidth: 750 }}>
              <Line data={dataToGraph} height={50} />
            </div>
            <div className="content">
              <p><b>Performace achieved from last epoch:</b></p>
              {
                averageParams.map(({ adParamName, value }) => (
                  <p key={`${adParamName}-${value}`}>
                    {' '}
                    {`${adParamName}: ${parseDecimal(value)}`}
                    {' '}
                  </p>
                ))
              }
            </div>
          </div>
          <div style={{ flexBasis: '100%', height: 0 }} key={`${name} ${status} division2`} />
          <div key={`${name} ${status} card-results`} className="card-results">
            <DataCard
              title="Data"
              linesOfContent={[
                { text: 'files selected from folder' },
                {
                  text: `*${inputFilePath}`,
                  isLink: true,
                  href: experiment.inputFiles[0].location_type === 'PATH_FILE'
                    ? `/${basePath}/-/blob/commit/${commitSha}/path/${inputFilePath}`
                    : `${linkToRepoView}/path/${inputFilePath}`,
                },
                { text: sourceBranch?.startsWith('data-instance') ? 'sourcing from data instance' : 'sourcing from' },
                { text: `*${sourceBranch || ''}`, isLink: true, href: linkToRepoView },
                { text: 'Last commit', isLink: false },
                { text: `${commitSha?.substring(0, 8)}`, isLink: true, href: `/my-projects/${projectId}/commit/${commitSha}` },
              ]}
            />
            <DataCard
              title="Model"
              linesOfContent={[
                { text: modelName, isLink: true, href: `/${nameSpace}/${slug}` },
              ]}
            />
            <DataCard
              title="Used Parameters"
              linesOfContent={trainingData}
            />
          </div>
        </>
      )}
    </>
  );
};

ExperimentSummary.propTypes = {
  projectId: number.isRequired,
  experiment: shape({
    processing: shape({
      parameters: arrayOf(shape({
        name: string.isRequired,
        value: string.isRequired,
      })).isRequired,
    }).isRequired,
    name: string.isRequired,
    authorName: string.isRequired,
    pipelineJobInfo: shape({
      createdAt: string.isRequired,
    }),
  }).isRequired,
};

export default ExperimentSummary;
