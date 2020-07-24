import React, { useState } from 'react';
import {
  string,
  arrayOf,
  shape,
  number,
} from 'prop-types';
import { toastr } from 'react-redux-toastr';
import './experimentsOverview.css';
import { Line } from 'react-chartjs-2';
import MModal from 'components/ui/MModal';
import GitlabPipelinesApi from 'apis/GitlabPipelinesApi';
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
import ExperimentsApi from 'apis/experimentApi';

const gitlabApi = new GitlabPipelinesApi();
const experimentApi = new ExperimentsApi();

const DataCard = ({ title, linesOfContent }) => (
  <div className="data-card">
    <div className="title">
      <p><b>{title}</b></p>
    </div>
    <div>
      {linesOfContent && linesOfContent.map((line, lineIndex) => {
        const lineContent = line.startsWith('*')
          ? <b>{line.replace('*', '')}</b>
          : line;
        return <p key={`${title} ${line} ${lineIndex.toString()}`} className="line">{lineContent}</p>;
      })}
    </div>
  </div>
);

DataCard.propTypes = {
  title: string.isRequired,
  linesOfContent: arrayOf(string).isRequired,
};

const ExperimentSummary = ({
  projectId,
  dataProjectId,
  experiment,
}) => {
  const experimentInstance = experiment;
  const [showSummary, setShowSummary] = useState(false);
  const [dataToGraph, setDataToGraph] = useState({
    datasets: [],
    labels: [],
  });
  const [averageParams, setAverageParams] = useState([]);
  const [shouldAbortModalRender, setShouldAbortModalRender] = useState(false);
  const sourceBranch = experimentInstance ? experimentInstance.sourceBranch : '';
  const { processing } = experimentInstance;
  const modelName = processing ? processing.name : '';
  const trainingData = processing.parameters ? processing.parameters.map((param) => (
    `*P: ${param.name} = ${param.value}`
  )) : [];

  const closeModal = () => setShouldAbortModalRender(false);

  function abortClickHandler(pipelineId) {
    gitlabApi.abortGitlabPipelines(
      projectId,
      pipelineId,
    )
      .then(() => experimentApi.cancelExperiment(dataProjectId, experiment.id))
      .then(() => toastr.success('Success', 'Pipeline aborted'))
      .catch(() => toastr.error('Error', 'Error aborting pipeline'))
      .finally(() => closeModal());
  }

  function handleArrowDownButtonClick() {
    const newIsShowingSum = !showSummary;
    setShowSummary(newIsShowingSum);
    if (!newIsShowingSum) {
      return;
    }
    try {
      experimentInstance.fromBlobToEpochs(experimentInstance.jsonBlob);
      setAverageParams(experimentInstance.generateAverageInformation());
      setDataToGraph({
        labels: Object.keys(experimentInstance.epochs),
        datasets: experimentInstance.generateChartInformation(),
      });
    } catch (error) {
      toastr.info('Experiment', error.message);
    }
  }

  function getButtonsDiv() {
    let buttons;
    const { slug: expName, status: experimentState } = experiment;
    const arrowBtn = (
      <ArrowButton
        imgPlaceHolder={traiangle01}
        callback={() => handleArrowDownButtonClick()}
        id={`ArrowButton-${expName}`}
        key={`ArrowButton-${expName}`}
      />
    );
    if (experimentState === RUNNING || experimentState === PENDING) {
      buttons = [
        arrowBtn,
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
    } else if (experimentState === SKIPPED) {
      buttons = [
        arrowBtn,
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
    } else if (experimentState === SUCCESS || experimentState === FAILED) {
      buttons = [
        arrowBtn,
        <button
          key={`dangerous-red-${expName}`}
          type="button"
          label="close"
          className="btn btn-icon btn-danger fa fa-times"
        />,
      ];
    } else if (experimentState === CANCELED) {
      buttons = [
        arrowBtn,
        <button
          key={`dangerous-red-${expName}`}
          type="button"
          label="close"
          className="btn btn-icon btn-danger fa fa-times"
        />,
      ];
    }
    return (
      <div className="buttons-div my-auto">{buttons}</div>
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
      {showSummary && (
        <>
          <div key={`${experimentInstance.name} ${experimentInstance.status} data-summary`} className="data-summary">
            <div style={{ width: '100%', minWidth: 700, maxWidth: 750 }}>
              <Line data={dataToGraph} height={50} />
            </div>
            <div className="content">
              <p><b>Performace achieved from last epoch:</b></p>
              {
                averageParams.map(({ name, value }) => (
                  <p key={`${name}-${value}`}>
                    {' '}
                    {`${name}: ${parseDecimal(value)}`}
                    {' '}
                  </p>
                ))
              }
            </div>
          </div>
          <div style={{ flexBasis: '100%', height: 0 }} key={`${experimentInstance.name} ${experimentInstance.status} division2`} />
          <div key={`${experimentInstance.name} ${experimentInstance.status} card-results`} className="card-results">
            <DataCard
              title="Data"
              linesOfContent={[
                'files selected from folder',
                `*${experiment.inputFiles.map((file) => `${file.location}`).toString()}`,
                sourceBranch.startsWith('data-instance')
                  ? 'sourcing from data instance'
                  : 'sourcing from',
                `*${sourceBranch}`,
              ]}
            />
            <DataCard
              title="Model"
              linesOfContent={[
                `*${modelName}`,
                // 'from',
                // `*branch:${experimentInstance.name}`,
                // 'authored by',
                // `*${userName} ${getTimeCreatedAgo(timeCreatedAgo, today)}`,
                // 'being',
                // `*${ahead} commits ahead and ${behind} commits behind`,
                // `of its ${defaultBranch} branch`,
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
  defaultBranch: string.isRequired,
  experiments: shape({
    processing: shape({
      parameters: shape({
        name: string.isRequired,
        value: string.isRequired,
      }),
    }),
    name: string.isRequired,
    authorName: string.isRequired,
    pipelineJobInfo: shape({
      createdAt: string.isRequired,
    }),
  }),
};

export default ExperimentSummary;
