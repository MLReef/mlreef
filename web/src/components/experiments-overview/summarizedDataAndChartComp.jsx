import React, { useState, useEffect } from 'react';
import {
  string,
  arrayOf,
  shape,
  number,
} from 'prop-types';
import { Base64 } from 'js-base64';
import './experimentsOverview.css';
import { Line } from 'react-chartjs-2';
import { toastr } from 'react-redux-toastr';
import { CircularProgress } from '@material-ui/core';
import FilesApi from '../../apis/FilesApi';
import BranchesApi from '../../apis/BranchesApi';
import traiangle01 from '../../images/triangle-01.png';
import ArrowButton from '../arrow-button/arrowButton';
import snippetApi from '../../apis/SnippetApi';
import {
  getTimeCreatedAgo,
  parseDataAndRefreshChart,
  parseDecimal,
  parseMlreefConfigurationLines,
} from '../../functions/dataParserHelpers';
import {
  SKIPPED,
  RUNNING,
  SUCCESS,
  CANCELED,
  FAILED,
  PENDING,
} from '../../dataTypes';


const DataCard = ({ title, linesOfContent }) => (
  <div className="data-card">
    <div className="title">
      <p><b>{title}</b></p>
    </div>
    <div>
      {linesOfContent.map((line, lineIndex) => {
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

const SummarizedDataAndChartComp = ({ experiment, projectId, defaultBranch }) => {
  const [showSummary, setShowSummary] = useState(false);
  const [dataToGraph, setDataToGraph] = useState({
    datasets: [],
    labels: [],
  });
  const [parametersForDataCard, setParametersForDataCard] = useState([]);
  const [isFetchingParams, setIsFetchingParams] = useState(true);
  const [averageParams, setAverageParams] = useState([]);
  const [ahead, setAhead] = useState(0);
  const [behind, setBehind] = useState(0);
  const {
    descTitle,
    currentState,
    userName,
    timeCreatedAgo,
  } = experiment;

  useEffect(() => {
    BranchesApi.compare(projectId, descTitle, defaultBranch)
      .then((res) => setBehind(res.commits.length)).catch((err) => err);
    BranchesApi.compare(projectId, defaultBranch, descTitle)
      .then((res) => setAhead(res.commits.length)).catch((err) => err);
  }, [ahead, behind, projectId, descTitle, defaultBranch]);

  function retrieveStatisticsFromApi() {
    const branchName = descTitle.replace('/', '-');
    snippetApi.getSnippetFile(
      projectId,
      branchName,
      'experiment.json',
    ).then((res) => {
      const parsedData = parseDataAndRefreshChart(res);
      setDataToGraph(parsedData.data);
      setAverageParams(parsedData.averageParams);
    }).catch(
      () => {
        setDataToGraph({
          datasets: [],
          labels: [],
        });
      },
    );

    FilesApi
      .getFileData(
        projectId,
        '.mlreef.yml',
        descTitle,
      )
      .then((fileData) => {
        const dataParsedInLines = Base64.decode(fileData.content).split('\n');
        const match = dataParsedInLines.filter((line) => line.startsWith('# source-branch-name'))[0];
        const sourceBranch = match.split(':')[1];
        const isSourceBranchDataInstance = sourceBranch.startsWith('data-instance');
        const configuredOperations = parseMlreefConfigurationLines(dataParsedInLines);
        const folder = configuredOperations[0].params.filter((param) => param.name === 'images-path')[0].value;

        setParametersForDataCard({ folder, sourceBranch, isSourceBranchDataInstance });
      })
      .catch(() => {
        toastr.error('Error', 'Something went wrong parsing your configuration');
      }).finally(() => {
        setIsFetchingParams(false);
      });
  }

  function handleArrowDownButtonClick() {
    setShowSummary(!showSummary);
    retrieveStatisticsFromApi();
  }

  function getButtonsDiv(experimentState) {
    let buttons;
    const commitCode = descTitle.split('/')[1];
    const arrowBtn = (
      <ArrowButton
        imgPlaceHolder={traiangle01}
        callback={() => handleArrowDownButtonClick()}
        params={{}}
        id={`ArrowButton-${commitCode}`}
        key={`ArrowButton-${commitCode}`}
      />
    );
    if (experimentState === RUNNING || experimentState === PENDING) {
      buttons = [
        arrowBtn,
        <button
          key={`dangerous-red-${commitCode}`}
          type="button"
          className="btn btn-danger"
          style={{ width: 'max-content' }}
        >
          Abort
        </button>,
      ];
    } else if (experimentState === SKIPPED) {
      buttons = [
        arrowBtn,
        <button
          key={`dangerous-red-${commitCode}`}
          type="button"
          label="close"
          className="btn btn-icon btn-danger fa fa-times"
        />,
        <button
          key={`deploy-${commitCode}`}
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
          key={`dangerous-red-${commitCode}`}
          type="button"
          label="close"
          className="btn btn-icon btn-danger fa fa-times"
        />,
      ];
    } else if (experimentState === CANCELED) {
      buttons = [
        arrowBtn,
        <button
          key={`dangerous-red-${commitCode}`}
          type="button"
          label="close"
          className="btn btn-icon btn-danger fa fa-times"
        />,
      ];
    }
    return (
      <div className="buttons-div">{buttons}</div>
    );
  }
  return (
    <>
      {getButtonsDiv(currentState)}
      {showSummary && (
        <>
          <div key={`${descTitle} ${currentState} data-summary`} className="data-summary">
            <div style={{ width: '100%', minWidth: 700, maxWidth: 750 }}>
              <Line data={dataToGraph} height={50} />
            </div>
            <div className="content">
              <p><b>Performace achieved from last epoch:</b></p>
              {
                averageParams.map((opt) => (
                  <p key={`${opt.name}-${opt.value}`}>
                    {' '}
                    {`${opt.name}: ${parseDecimal(opt.value)}`}
                    {' '}
                  </p>
                ))
              }
            </div>
          </div>
          <div style={{ flexBasis: '100%', height: 0 }} key={`${descTitle} ${currentState} division2`} />
          <div key={`${descTitle} ${currentState} card-results`} className="card-results">
            {isFetchingParams ? (
              <CircularProgress size={20} />
            )
              : (
                <DataCard
                  title="Data"
                  linesOfContent={[
                    'files selected from folder',
                    `*${parametersForDataCard.folder}`,
                    parametersForDataCard.isSourceBranchDataInstance
                      ? 'sourcing from data instance'
                      : 'sourcing from',
                    `*${parametersForDataCard.sourceBranch}`,
                  ]}
                />
              )}
            <DataCard
              title="Algorithm"
              linesOfContent={[
                '*Resnet 50',
                'from',
                `*branch:${descTitle}`,
                'authored by',
                `*${userName}${' '}${getTimeCreatedAgo(timeCreatedAgo)}`,
                'being',
                `*${ahead} commits ahead and ${behind} commits behind`,
                `of its ${defaultBranch} branch`,
              ]}
            />
            <DataCard
              title="Training"
              linesOfContent={[
                '*10 epochs trained',
                'with',
                '*P: learning_r = 0.002',
                '*P: optimizer = adam',
                '*P: lr_decay = 0.0005',
                '*P: layers = 3',
                '*P: dropout = 0.5',
                '*P: alpha = 1',
              ]}
            />
          </div>
        </>
      )}
    </>
  );
};

SummarizedDataAndChartComp.propTypes = {
  experiment: shape({
    currentState: string,
    descTitle: string,
    userName: string,
    percentProgress: string,
    eta: string,
    timeCreatedAgo: string,
  }).isRequired,
  projectId: number.isRequired,
  defaultBranch: string.isRequired,
};

export default SummarizedDataAndChartComp;
