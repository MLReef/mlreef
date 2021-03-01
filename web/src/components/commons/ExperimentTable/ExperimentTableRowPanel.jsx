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
import { ALGORITHM } from 'dataTypes';
import MLSearchApi from 'apis/MLSearchApi';

const Plot = React.lazy(() => import('customImports/ReactPlotly'));

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
};

const mlSearchApi = new MLSearchApi();

const ExperimentTableRowPanel = (props) => {
  const {
    className,
    experiments,
    currentId,
  } = props;

  const urlParams = useParams();

  const [model, setModel] = useState();

  const currentExperiment = useMemo(
    () => experiments.find((exp) => exp.id === currentId),
    [experiments, currentId],
  );

  const commitSha = useMemo(
    () => currentExperiment.pipelineJobInfo?.commitSha,
    [currentExperiment],
  );

  const parameters = useMemo(
    () => currentExperiment?.processing?.parameters,
    [currentExperiment],
  );

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

  const modelPath = useMemo(
    () => model && `/${model.gitlab_namespace}/${model.slug}`,
    [model],
  );

  const basePath = useMemo(
    () => `/${urlParams.namespace}/${urlParams.slug}`,
    [urlParams],
  );

  const sourcePath = useMemo(
    () => `${basePath}/-/repository/tree/-/commit/${commitSha}`,
    [commitSha, basePath],
  );

  const copyParameters = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(parameters))
        .then(null, (er) => {
          
        });
    }
  };

  const copyCommitSha = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(commitSha)
        .then(null, (er) => {
          
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
      const slug = currentExperiment.processing?.slug;

      mlSearchApi.searchPaginated(ALGORITHM, { slug }, 0, 1)
        .then((res) => res.content)
        .then((projects) => projects.length > 0 ? projects[0] : {})
        .then(setModel)
        .catch((err) => toastr.error('Error', err.message));
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
                <Link className="link-append-link border-rounded-left" to={`${basePath}/-/commits/${currentExperiment?.pipelineJobInfo?.commitSha}`}>
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
                <a href={modelPath} target="_blank" rel="noopener noreferrer">
                  {currentExperiment.processing?.name}
                </a>
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
              {parameters.map((p) => (
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
