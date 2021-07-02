import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  Suspense,
} from 'react';
import { Link, useParams } from 'react-router-dom';
import { toastr } from 'react-redux-toastr';
import PropTypes from 'prop-types';
import cx from 'classnames';
import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import useEffectNoFirstRender from 'customHooks/useEffectNoFirstRender';

const Plot = React.lazy(() => import('customImports/ReactPlotly'));
const api = new ProjectGeneralInfoApi();

const config = {
  modeBarButtonsToRemove: [
    'sendDataToCloud',
    'autoScale2d',
    'hoverClosestCartesian',
    'hoverCompareCartesian',
    'lasso2d',
    'select2d',
  ],
  displaylogo: false,
  showTips: true,
  responsive: true,
};

const ExperimentTableRowPanel = (props) => {
  const {
    className,
    experiments,
    currentId,
  } = props;

  const urlParams = useParams();

  const [model, setModel] = useState({});
  const [executedProcessorInfo, setExecutedProcessorInfo] = useState({});

  const currentExperiment = useMemo(
    () => experiments.find((exp) => exp.id === currentId),
    [experiments, currentId],
  );

  useEffectNoFirstRender(() => {
    const {
      branch,
      version,
    } = currentExperiment.processing;

    const {
      id,
    } = model;

    if (id && branch && version) {
      api.getVersionDataByBranchAndVId(id, branch, version)
        .then(setExecutedProcessorInfo)
        .catch((err) => toastr.error('Error', err?.message));
    }
  }, [currentExperiment, model]);

  console.log(model);
  const { commitSha } = currentExperiment?.pipelineJobInfo;
  const { parameters } = currentExperiment?.processing;

  const currentChart = useMemo(
    () => {
      const epochs = currentExperiment?.jsonBlob
        && Object.values(JSON.parse(currentExperiment.jsonBlob))
          .map((e) => {
            const res = { ...e };
            if (Object.prototype.hasOwnProperty.call(res, 'epoch')) {
              delete res.epoch;
            }
            return res;
          });

      if (!epochs) return null;

      const values = epochs.reduce((ac, i) => Object.entries(i)
        .reduce((ac2, [k, v]) => ({ ...ac2, [k]: (ac2[k] || []).concat(v) }), ac), {});

      const data = Object.entries(values).map(([k, y], i) => ({
        id: 1 + i,
        mode: 'lines',
        name: k,
        line: {
          width: 2,
          color: `hsl(${25 + (400 * i) / 7}, 85%, 50%)`,
        },
        y,
      }));

      return {
        data,
        layout: {
          height: 300,
          width: 600,
          showlegend: true,
          margin: {
            l: 30,
            r: 25,
            t: 25,
            b: 25,
          },
        },
      };
    },
    [currentExperiment],
  );

  const modelEntryFilePath = `/${model.gitlab_namespace}/${model.slug}`
    + `/-/blob/commit/${executedProcessorInfo.commit_sha}/path/${executedProcessorInfo.entry_file}`;

  const modelBranch = `/${model?.gitlab_namespace}/${model?.slug}/-/`
    + `repository/tree/-/commit/${executedProcessorInfo.commit_sha}`;

  const basePath = `/${urlParams.namespace}/${urlParams.slug}`;

  const sourcePath = `${basePath}/-/repository/tree/-/commit/${commitSha}`;

  const copyParameters = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(parameters))
        .then(null, (/* err */) => {

        });
    }
  };

  const copyCommitSha = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(commitSha)
        .then(null, (/* err */) => {

        });
    }
  };

  const copyModelCommitSha = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(executedProcessorInfo.commit_sha)
        .then(null, (/* err */) => {

        });
    }
  };

  const getFilePath = useCallback(
    (file) => {
      if (file.location_type === 'PATH_FILE') {
        return `${basePath}/-/blob/commit/${commitSha}/path/${file.location}`;
      }

      return `${basePath}/-/repository/tree/-/commit/${commitSha}/path/${file.location}`;
    },
    [commitSha, basePath],
  );

  useEffect(
    () => {
      api
        .getCodeProjectById(currentExperiment.processing?.project_id)
        .then((m) => {
          setModel(m);
        })
        .catch((err) => toastr.error('Error', err?.message));
    },
    [currentExperiment],
  );

  return (
    <div className={cx('experiment-table-row-panel', className)}>
      <div className="experiment-table-row-panel-cards">
        {currentChart && (
          <div className="experiment-table-row-panel-card stretch border-rounded">
            <div className="experiment-table-row-panel-card-title border-rounded-top">
              Metrics
            </div>
            <div className="experiment-table-row-panel-card-content">
              <Suspense fallback={<div>loading...</div>}>
                <Plot
                  data={currentChart.data}
                  layout={currentChart.layout}
                  config={config}
                />
              </Suspense>
            </div>
          </div>
        )}
      </div>

      <div className="experiment-table-row-panel-cards">
        <div className="experiment-table-row-panel-card border-rounded">
          <div className="experiment-table-row-panel-card-title border-rounded-top">
            Data
          </div>
          <div className="experiment-table-row-panel-card-content">
            <p className="m-2">
              files selected from folder
            </p>
            <ul className="file-list">
              {currentExperiment?.inputFiles.map((f) => (
                <li key={f?.location} className="file-list-item">
                  <Link to={getFilePath(f)} className="mr-2">
                    {f.location}
                  </Link>
                  <i className="fa fa-folder" />
                </li>
              ))}
            </ul>
            <p className="ml-2 m-2">
              sourced from branch
            </p>
            <p className="file-list-item">
              <Link to={sourcePath}>
                {currentExperiment.sourceBranch}
              </Link>
            </p>
            <p className="ml-2 m-2 flex">
              <span className="">
                Latest commit:
              </span>
              <span className="link-append">
                <Link className="link-append-link border-rounded-left" to={`${basePath}/-/commits/${currentExperiment.pipelineJobInfo.commitSha}`}>
                  {currentExperiment.pipelineJobInfo?.commitSha?.substring(0, 8)}
                </Link>
                <i
                  onClick={copyCommitSha}
                  className="link-append-copy border-rounded-right fa fa-copy t-dark"
                />
              </span>
            </p>
          </div>
        </div>
        <div className="experiment-table-row-panel-card border-rounded">
          <div className="experiment-table-row-panel-card-title border-rounded-top">
            Model
          </div>
          {model && (
            <div className="experiment-table-row-panel-card-content">
              <p className="ml-2 m-2">
                Model used (repository)
              </p>
              <p className="file-list-item">
                <a href={modelEntryFilePath} target="_blank" rel="noopener noreferrer">
                  {currentExperiment.processing?.name}
                </a>
              </p>
              <p className="ml-2 m-2">
                Branch published
              </p>
              <p className="file-list-item">
                <a href={modelBranch} target="_blank" rel="noopener noreferrer">
                  {currentExperiment.processing?.branch}
                </a>
              </p>
              <p className="ml-2 m-2">
                Relevant publication
              </p>
              <p className="file-list-item">
                <a 
                  href={`/${model?.gitlab_namespace}/${model?.slug}/-/publications/${executedProcessorInfo?.gitlab_pipeline_id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                 {executedProcessorInfo.slug}
                </a>
              </p>
              <p className="ml-2 m-2 flex">
                <span className="">
                  Latest commit:
                </span>
                <span className="link-append">
                  <a 
                    className="link-append-link border-rounded-left" 
                    href={`/${model?.gitlab_namespace}/${model?.slug}/-/commits/${executedProcessorInfo.commit_sha}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {executedProcessorInfo?.commit_sha?.substring(0, 8)}
                  </a>
                  <i
                    onClick={copyModelCommitSha}
                    className="link-append-copy border-rounded-right fa fa-copy t-dark"
                  />
                </span>
              </p>
            </div>
          )}
        </div>
        <div className="experiment-table-row-panel-card border-rounded">
          <div className="experiment-table-row-panel-card-title border-rounded-top">
            Training
          </div>
          <div className="experiment-table-row-panel-card-content">
            <div className="parameter-list-title">
              <p className="m-2">Parameters:</p>
              <button
                type="button"
                label="copy"
                title="Copy parameters in json format"
                className="btn btn-hidden fa fa-copy t-dark m-2"
                onClick={copyParameters}
              />
            </div>
            <ul className="parameter-list">
              {parameters?.map((p) => (
                <li className="parameter-list-item" key={`param-${p.name}`}>
                  <span className="parameter-list-item-name" title={`[${p.type}] ${p.description}`}>
                    {p.name}
                  </span>
                  <span className="parameter-list-item-value">
                    {p.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

ExperimentTableRowPanel.defaultProps = {
  className: '',
  experiments: [],
};

ExperimentTableRowPanel.propTypes = {
  className: PropTypes.string,
  experiments: PropTypes.arrayOf(PropTypes.shape),
  currentId: PropTypes.string.isRequired,
};

export default ExperimentTableRowPanel;
