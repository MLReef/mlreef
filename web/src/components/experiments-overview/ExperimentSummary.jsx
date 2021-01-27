import React, { useState, useEffect } from 'react';
import {
  string,
  shape,
  number,
  arrayOf,
} from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { toastr } from 'react-redux-toastr';
import './experimentsOverview.css';
import { Line } from 'react-chartjs-2';
import AuthWrapper from 'components/AuthWrapper';
import GitlabPipelinesApi from 'apis/GitlabPipelinesApi.ts';
import ExperimentsApi from 'apis/experimentApi';
import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import { fireModal } from 'store/actions/actionModalActions';
import DataCard from 'components/layout/DataCard';
import ArrowButton from '../arrow-button/arrowButton';
import {
  parseDecimal, parseToCamelCase,
} from '../../functions/dataParserHelpers';
import {
  RUNNING,
  SUCCESS,
  CANCELED,
  FAILED,
  PENDING,
  ALGORITHM,
} from '../../dataTypes';
import ExperimentCancellationModal from './cancellationModal';
import DeleteExperimentModal from './DeletionModal';
import { plainToClass } from 'class-transformer';
import Experiment from 'domain/experiments/Experiment';
import MLSearchApi from 'apis/MLSearchApi';
import { setCodeProjects } from 'store/actions/projectInfoActions';

const gitlabApi = new GitlabPipelinesApi();
const experimentApi = new ExperimentsApi();
const mlSearchApi = new MLSearchApi();

const onPositiveDelete = (dataProjectId, experimentId) => () => experimentApi
  .delete(dataProjectId, experimentId)
  .then(() => toastr.success('Success', 'Experiment deleted'))
  .catch(() => toastr.error('Error', 'Something failed deleting'))
  .finally(() => window.location.reload());

const ExperimentSummary = ({
  projectId,
  dataProjectId,
  projectNamespace,
  projectSlug,
  experiment,
  actions,
}) => {
  const classExp = plainToClass(Experiment, parseToCamelCase(experiment));
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
    processing: { slug: dataProcessorSlug }
  } = experiment;

  const inputFilePath = inputFiles[0].location.toString();
  const basePath = `${projectNamespace}/${projectSlug}`;
  const [averageParams, setAverageParams] = useState([]);
  const [codeProject, setcodeProject] = useState({});
  const modelName = processing ? processing.name : '';
  const trainingData = processing.parameters ? processing.parameters.map((param) => (
    { text: `*P: ${param.name} = ${param.value}` }
  )) : [];

  useEffect(() => {
    mlSearchApi.searchPaginated(ALGORITHM, { slug: dataProcessorSlug }, 0, 1)
      .then((res) => res.content)
      .then((projects) => projects.length > 0 ? projects[0] : {})
      .then(setcodeProject)
      .catch((err) => toastr.error('Error', err.message));
  }, [dataProcessorSlug]);

  const { gitlab_namespace: nameSpace, slug } = codeProject;
  const linkToRepoView = `/${basePath}/-/repository/tree/-/commit/${commitSha}`;

  function handleArrowDownButtonClick() {
    const newIsShowingSum = !showSummary;
    setShowSummary(newIsShowingSum);
    if (!newIsShowingSum) {
      return;
    }
    try {
      classExp.fromBlobToEpochs(jsonBlob);
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
        callback={handleArrowDownButtonClick}
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
          onClick={() => {
            actions.fireModal({
              title: 'Abort experiments?',
              type: 'danger',
              closable: true,
              content: <ExperimentCancellationModal
                experimentToAbort={experiment}
              />,
              onPositive: () => {
                gitlabApi.abortGitlabPipelines(
                  projectId,
                  experiment.pipelineJobInfo.id,
                )
                  .then(() => {
                    experimentApi.cancelExperiment(dataProjectId, id);
                    toastr.success('Success', 'Pipeline aborted');
                    window.location.reload();
                  })
                  .catch(() => toastr.error('Error', 'Error aborting pipeline'));
              },
            });
          }}
        >
          Abort
        </button>,
      ];
    } else if (experimentStatus === SUCCESS || experimentStatus === FAILED) {
      buttons = [
        <button
          key={`dangerous-red-${expName}`}
          type="button"
          label="close"
          className="btn btn-icon btn-danger fa fa-times"
          onClick={() => actions.fireModal({
            title: 'Delete experiments?',
            type: 'danger',
            closable: true,
            content: <DeleteExperimentModal
              experiment={experiment}
            />,
            onPositive: onPositiveDelete(dataProjectId, experiment.id),
          })}
        />,
      ];
    } else if (experimentStatus === CANCELED) {
      buttons = [
        <button
          key={`dangerous-red-${expName}`}
          type="button"
          label="close"
          className="btn btn-icon btn-danger fa fa-times"
          onClick={() => actions.fireModal({
            title: 'Delete experiments?',
            type: 'danger',
            closable: true,
            content: <DeleteExperimentModal
              experiment={experiment}
            />,
            onPositive: onPositiveDelete(dataProjectId, experiment.id),
          })}
        />,
      ];
    }

    return (
      <div className="buttons-div my-auto">
        <AuthWrapper minRole={30} norender>
          {[...buttons, arrowBtn].reverse()}
        </AuthWrapper>
      </div>
    );
  }

  return (
    <>
      {getButtonsDiv()}
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
                { text: `${commitSha?.substring(0, 8)}`, isLink: true, href: `/${nameSpace}/${slug}/-/commits/${commitSha}` },
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

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      fireModal,
    }, dispatch),
  };
}

export default connect(() => ({}), mapDispatchToProps)(ExperimentSummary);
