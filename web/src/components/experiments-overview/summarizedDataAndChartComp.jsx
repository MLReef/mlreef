import React, { useState, useEffect } from 'react';
import {
  string,
  arrayOf,
  shape,
  number,
  instanceOf,
} from 'prop-types';
import './experimentsOverview.css';
import { Line } from 'react-chartjs-2';
import BranchesApi from '../../apis/BranchesApi';
import traiangle01 from '../../images/triangle-01.png';
import ArrowButton from '../arrow-button/arrowButton';
import {
  getTimeCreatedAgo,
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

const SummarizedDataAndChartComp = ({
  experiment, projectId, defaultBranch, today, userParameters,
}) => {
  const [showSummary, setShowSummary] = useState(false);
  const [dataToGraph] = useState({
    datasets: [],
    labels: [],
  });
  const [averageParams] = useState([]);
  const [ahead, setAhead] = useState(0);
  const [behind, setBehind] = useState(0);
  const {
    descTitle,
    currentState,
    userName,
    timeCreatedAgo,
    experimentData,
  } = experiment;

  const sourceBranch = experimentData ? experimentData.source_branch : '';
  const modelName = experimentData && experimentData.processing.name;
  const trainingData = userParameters && userParameters.map((param) => (
    `*P: ${param.name} = ${param.value}`
  ));

  useEffect(() => {
    BranchesApi.compare(projectId, descTitle, defaultBranch)
      .then((res) => setBehind(res.commits.length)).catch((err) => err);
    BranchesApi.compare(projectId, defaultBranch, descTitle)
      .then((res) => setAhead(res.commits.length)).catch((err) => err);
  }, [ahead, behind, projectId, descTitle, defaultBranch]);

  function handleArrowDownButtonClick() {
    setShowSummary(!showSummary);
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
            <DataCard
              title="Data"
              linesOfContent={[
                'files selected from folder',
                '*folders',
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
                //'from',
                //`*branch:${descTitle}`,
                //'authored by',
                //`*${userName} ${getTimeCreatedAgo(timeCreatedAgo, today)}`,
                //'being',
                //`*${ahead} commits ahead and ${behind} commits behind`,
                //`of its ${defaultBranch} branch`,
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
  today: instanceOf(Date).isRequired,
  userParameters: arrayOf(
    shape({}).isRequired,
  ).isRequired,
};

export default SummarizedDataAndChartComp;
