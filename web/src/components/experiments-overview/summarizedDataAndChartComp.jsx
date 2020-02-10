import React from 'react';
import {
  string,
  arrayOf,
  shape,
  number,
} from 'prop-types';
import './experimentsOverview.css';
import { Line } from 'react-chartjs-2';
import traiangle01 from '../../images/triangle-01.png';
import ArrowButton from '../arrow-button/arrowButton';
import snippetApi from '../../apis/SnippetApi';
import {
  parseDataAndRefreshChart,
  parseDecimal
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
      {linesOfContent.map((line) => {
        const lineContent = line.startsWith('*')
          ? <b>{line.replace('*', '')}</b>
          : line;
        return <p key={`${title} ${line}`} className="line">{lineContent}</p>;
      })}
    </div>
  </div>
);

DataCard.propTypes = {
  title: string.isRequired,
  linesOfContent: arrayOf(string).isRequired,
};

const SummarizedDataAndChartComp = ({ experiment, projectId }) => {
  const [showSummary, setShowSummary] = React.useState(false);
  const [dataToGraph, setDataToGraph] = React.useState({
    datasets: [],
    labels: [],
  });
  const [averageParams, setAverageParams] = React.useState([]);
  const { descTitle, currentState } = experiment;

  function retrieveStatisticsFromApi() {
    return snippetApi.getSnippetFile(
      projectId,
      descTitle.replace('/', '-'),
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
          className="dangerous-red"
          style={{ width: 'max-content' }}
        >
          <b>
            Abort
          </b>
        </button>,
      ];
    } else if (experimentState === SKIPPED) {
      buttons = [
        arrowBtn,
        <button
          key={`dangerous-red-${commitCode}`}
          type="button"
          className="dangerous-red"
        >
          <b>
            X
          </b>
        </button>,
        <button
          key={`deploy-${commitCode}`}
          type="button"
          className="light-green-button rounded-pipeline-btn non-active-black-border"
          style={{ width: '100px' }}
        >
          <b>Resume</b>
        </button>,
      ];
    } else if (experimentState === SUCCESS || experimentState === FAILED) {
      buttons = [
        arrowBtn,
        <button
          key={`dangerous-red-${commitCode}`}
          type="button"
          className="dangerous-red"
        >
          <b>
              X
          </b>
        </button>,
      ];
    } else if (experimentState === CANCELED) {
      buttons = [
        arrowBtn,
        <button
          key={`dangerous-red-${commitCode}`}
          type="button"
          className="dangerous-red"
        >
          <b>
              X
          </b>
        </button>,
      ];
    }
    return (
      <div className="buttons-div">{buttons}</div>
    );
  }
  return (
    <>
      {getButtonsDiv(currentState)}
      <div style={{ flexBasis: '100%', height: 0 }} key={`${descTitle} ${currentState} division1`} />
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
                    {`${opt.name}: ${ parseDecimal(opt.value) }`}
                    {' '}
                  </p>
                ))
              }
            </div>
          </div>
          <div style={{ flexBasis: '100%', height: 0 }} key={`${descTitle} ${currentState} division2`} />
          <div key={`${descTitle} ${currentState} card-results`} className="card-results">
            <DataCard
              title="Data"
              linesOfContent={[
                '*3.245 files selected',
                '  from',
                '*data instance: DL_pipeline_1',
                'resulting from a data pipeline with',
                '*op1: Augment',
                '*op2: Random Crop',
                '*op3: Rotate',
                'sourced from',
                '*data branch: Master',
              ]}
            />
            <DataCard
              title="Algorithm"
              linesOfContent={[
                '*Resnet 50',
                'from',
                '*branch: feature/3-layers',
                'authored by',
                '*Camillo 8 hours ago',
                'being',
                '*2 commits and 1 commit behind',
                'of its master branch',
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
    modelTitle: string,
    timeCreatedAgo: string,
  }).isRequired,
  projectId: number.isRequired,
};

export default SummarizedDataAndChartComp;
