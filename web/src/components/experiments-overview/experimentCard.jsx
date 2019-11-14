
import React, { Component } from 'react';
import {
  string,
  arrayOf,
  shape,
  number,
  func,
} from 'prop-types';
import './experimentsOverview.css';
import $ from 'jquery';
import uuidv1 from 'uuid/v1';
import { Line } from 'react-chartjs-2';
import traiangle01 from '../../images/triangle-01.png';
import ArrowButton from '../arrow-button/arrowButton';
import snippetApi from '../../apis/SnippetApi';
import {
  getTimeCreatedAgo,
  generateSummarizedInfo,
  mapSummarizedInfoToDatasets,
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

class ExperimentCard extends Component {
  constructor(props) {
    super(props);
    const { params } = this.props;
    this.state = {
      showChart: false,
      chartDivId: new Date().getTime(),
      experiments: params.experiments,
      dataToPlot: [],
    };

    this.handleArrowDownButtonClick = this.handleArrowDownButtonClick.bind(this);
  }

  getButtonsDiv(experimentState, index) {
    let buttons;
    const uniqueCode = uuidv1();
    const arrowBtn = (
      <ArrowButton
        imgPlaceHolder={traiangle01}
        callback={this.handleArrowDownButtonClick}
        params={{ ind: index }}
        id={`ArrowButton-${index}`}
        key={`ArrowButton-${uniqueCode}-${index}`}
      />
    );
    if (experimentState === RUNNING || experimentState === PENDING) {
      buttons = [
        arrowBtn,
        <button
          key={`dangerous-red-${uniqueCode}`}
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
          key={`dangerous-red-${uniqueCode}`}
          type="button"
          className="dangerous-red"
        >
          <b>
            X
          </b>
        </button>,
        <button
          key={`deploy-${uniqueCode}`}
          type="button"
          className="light-green-button experiment-button non-active-black-border"
          style={{ width: '100px' }}
        >
          <b>Resume</b>
        </button>,
      ];
    } else if (experimentState === SUCCESS || experimentState === FAILED) {
      buttons = [
        arrowBtn,
        <button
          key={`dangerous-red-${uniqueCode}`}
          type="button"
          className="dangerous-red"
        >
          <b>
            X
          </b>
        </button>,
        <button
          key={`deploy-${uniqueCode}`}
          type="button"
          className="light-green-button experiment-button non-active-black-border"
          style={{ width: '100px' }}
        >
          <b>Deploy</b>
        </button>,
      ];
    } else if (experimentState === CANCELED) {
      buttons = [
        arrowBtn,
        <button
          key={`dangerous-red-${uniqueCode}`}
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

  parseDataAndRefreshChart(jsonExperimentFileParsed, index) {
    const { chartDivId, experiments } = this.state;
    const chartDiv = document.getElementById(chartDivId);
    if (jsonExperimentFileParsed.length === 0) {
      return;
    }
    const cardResults = `${chartDivId}-Idcard-results-${index}`;
    const exp = experiments[index];
    const summarizedInfo = generateSummarizedInfo(jsonExperimentFileParsed);
    const dataSets = mapSummarizedInfoToDatasets(summarizedInfo);
    const labels = Object.keys(dataSets[0].data);
    const avgValues = Object.keys(summarizedInfo)
      .filter((sInfoItem) => sInfoItem.startsWith('avg_'))
      .map((sInfoItem) => ({
        name: sInfoItem.substring(4, sInfoItem.length),
        value: summarizedInfo[sInfoItem],
      }));
    exp.data = { labels, datasets: dataSets };
    exp.averageParams = avgValues;

    const newExperimentsArr = experiments;
    newExperimentsArr[index] = exp;
    if (exp.data) {
      chartDiv.parentNode.childNodes[1].style.display = 'unset';
      $(`#${cardResults}`).css('display', 'flex');
      this.setState({
        experiments: newExperimentsArr,
        dataToPlot: exp.data,
      });
    }
  }

  retrieveStatisticsFromApi(index) {
    const { params } = this.props;
    const { experiments } = this.state;
    return snippetApi.getSnippetFile(
      params.projectId,
      experiments[index].descTitle.replace('/', '-'),
      'experiment.json',
      'gitlab.com',
    ).then((res) => {
      this.parseDataAndRefreshChart(res, index);
      this.retrieveDataConstantly(experiments[index].status, index);
    }).catch(
      () => {
        this.parseDataAndRefreshChart([], index);
        this.retrieveDataConstantly(experiments[index].status, index);
      },
    );
  }

  retrieveDataConstantly(status, index) {
    if (status === RUNNING
      || status === PENDING
    ) {
      setTimeout(() => {
        this.retrieveStatisticsFromApi(index);
      }, 30000);
    }
  }

  handleArrowDownButtonClick(e, params) {
    const index = params.ind;
    const newState = { ...this.state };
    const { chartDivId } = this.state;

    const chartDiv = document.getElementById(chartDivId);
    const cardResults = `${chartDivId}-Idcard-results-${index}`;
    newState.showChart = !newState.showChart;
    this.setState(
      newState,
    );
    if (newState.showChart) {
      this.retrieveStatisticsFromApi(index);
    } else {
      $(`#${cardResults}`).css('display', 'none');
      chartDiv.parentNode.childNodes[1].style.display = 'none';
    }
  }

  render() {
    const { params, setSelectedExperiment } = this.props;
    const {
      chartDivId,
      experiments,
      dataToPlot,
      showChart,
    } = this.state;
    const today = new Date();
    return (
      <div className="experiment-card">
        <div className="header">
          <div className="title-div">
            <p><b>{params.currentState}</b></p>
          </div>
          <div className="select-div">
            <select>
              <option value="">Sort by</option>
            </select>
          </div>
        </div>

        {experiments.map((experiment, index) => {
          let modelDiv = 'inherit';
          let progressVisibility = 'inherit';
          if (!experiment.percentProgress) {
            modelDiv = 'hidden';
          }
          if (!experiment.modelTitle) {
            progressVisibility = 'hidden';
          }
          return (
            <div
              key={`${experiment.timeCreatedAgo}-${experiment.descTitle}-${index}`}
              className="card-content"
            >
              <div className="summary-data">
                <div className="project-desc-experiment">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedExperiment(experiment);
                    }}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      marginTop: 7,
                      padding: 0,
                    }}
                  >
                    <b>{experiment.descTitle}</b>
                  </button>
                  <p id="time-created-ago">
                    Created by
                    &nbsp;
                    <b>{experiment.userName}</b>
                    <br />
                    {getTimeCreatedAgo(experiment.timeCreatedAgo, today)}
                    &nbsp;
                    ago
                  </p>
                </div>
                <div className="project-desc-experiment" style={{ visibility: progressVisibility }}>
                  <p>
                    <b>
                      {experiment.percentProgress}
                      % completed
                    </b>
                  </p>
                  <p>
                    ETA:
                    {' '}
                    {experiment.eta}
                    {' '}
                    hours
                  </p>
                </div>
                <div className="project-desc-experiment" style={{ visibility: modelDiv }}>
                  <p>
                    Model:
                    {' '}
                    <b>{experiment.modelTitle}</b>
                  </p>
                  <p>
                    {experiment.averageParams
                      .filter((avgParam) => avgParam.showBellowModel)
                      .map((avgParam) => `${avgParam.name}: ${avgParam.value}`)}
                  </p>
                </div>
                {this.getButtonsDiv(experiment.currentState, index)}
              </div>
              <div className="data-summary">
                {showChart && (
                  <div className="chart-container" id={chartDivId}>
                    <Line data={dataToPlot} height={50} />
                  </div>
                )}
                <div className="content">
                  <p><b>Performace achieved from last epoch:</b></p>
                  {
                        experiment.averageParams.map((opt, index) => (
                          <p key={`${opt.name}-${index}`}>
                            {' '}
                            {`${opt.name}: ${opt.value}`}
                            {' '}
                          </p>
                        ))
                    }
                </div>
              </div>
              <div className="card-results" id={`${chartDivId}-Idcard-results-${index}`}>
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
            </div>
          );
        })}
      </div>
    );
  }
}

ExperimentCard.propTypes = {
  params: shape({
    currentState: string.isRequired,
    experiments: arrayOf(
      shape({
        currentState: string,
        descTitle: string,
        userName: string,
        percentProgress: string,
        eta: string,
        modelTitle: string,
        timeCreatedAgo: string,
        averageParams: arrayOf,
        data: arrayOf,
      }),
    ).isRequired,
    projectId: number.isRequired,
  }).isRequired,
  setSelectedExperiment: func.isRequired,
};

export default ExperimentCard;
