import React, {
  Suspense,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import MSimpleSelect from 'components/ui/MSimpleSelect';

const Plot = React.lazy(() => import('customImports/ReactPlotly'));

const config = {
  responsive: true,
};

const concatByGroup = (ac, [k, v]) => ({ ...ac, [k]: (ac[k] || []).concat(v) });

const parseBlobToData = (blob) => {
  if (!blob) return {};

  const jb = blob && JSON.parse(blob);
  const a = Object.values(jb || {});

  return a.reduce((acc, { epoch, ...rest }) => Object
    .entries(rest).reduce(concatByGroup, acc), {});
};

const pickLabels = (acc, exp) => Object.keys(exp.data)
  .reduce((list, d) => list.concat(d), acc);

const arrangeData = (blob) => Object.entries(parseBlobToData(blob))
  .reduce((acc, [name, y]) => ({
    ...acc,
    [name]: y,
  }), {});

const ExperimentTableOverallGraph = (props) => {
  const {
    className,
    experiments,
    small,
    currentMetric,
    onClose,
    onSelectMetric,
  } = props;

  const sortedExperiments = useMemo(
    () => !experiments.length ? [] : experiments.map((exp) => ({
      id: exp.id,
      name: exp.name.replace('experiment/', ''),
      data: exp.hidden ? [] : arrangeData(exp.jsonBlob),
    })),
    [experiments],
  );

  const labels = useMemo(
    () => new Set(sortedExperiments.reduce(pickLabels, [])),
    [sortedExperiments],
  );

  const graphByLabel = useCallback(
    (label) => sortedExperiments.map((exp, i) => ({
      id: exp.id,
      mode: 'lines',
      name: exp.name,
      line: {
        width: 2,
        color: `hsl(${25 + (400 * i) / 7}, 85%, 50%)`,
      },
      y: exp.data[label] || [],
    })),
    [sortedExperiments],
  );

  const currentData = useMemo(
    () => graphByLabel(currentMetric),
    [graphByLabel, currentMetric],
  );

  const handleClick = useCallback(
    (e) => {
      const expId = e.points[0]?.data?.id;

      if (window?.open) {
        window.open(`experiments/${expId}`, '_blank', 'noopener');
      }
    },
    [],
  );

  useEffect(
    () => {
      if (!currentMetric && labels.size) {
        onSelectMetric(Array.from(labels)[0]);
      }
    },
    // do not add onSelectMetric or currentMetric
    // eslint-disable-next-line
    [labels],
  );

  const layout = {
    showlegend: false,
    hovermode: 'closest',
    legend: {
      x: 0.1,
      y: 1.3,
    },
    height: 300,
    width: small ? 500 : 650,
    margin: {
      l: 30,
      r: 25,
      t: 25,
      b: 25,
    },
  };

  return (
    <div className={cx('experiment-table-overall-graph', className)}>
      <div className="experiment-table-row-panel-card stretch border-rounded">
        <div className="experiment-table-row-panel-card-title border-rounded-top">
          {`X: Epoch, Y: ${currentMetric}`}
          {onClose && (
            <button
              type="button"
              className="menu-btn fa fa-times ml-auto mr-2"
              label="menu"
              onClick={onClose}
            />
          )}
        </div>
        <div className="experiment-table-row-panel-card-content">
          <MSimpleSelect
            className="experiment-table-overall-graph-select"
            options={Array.from(labels).map((label) => ({ label, value: label }))}
            onChange={(l) => onSelectMetric(l)}
            value={currentMetric}
          />
          <Suspense fallback={<div>loading...</div>}>
            <Plot
              data={currentData}
              layout={layout}
              config={config}
              onClick={handleClick}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

ExperimentTableOverallGraph.defaultProps = {
  className: '',
  experiments: [],
  small: false,
  onClose: null,
  onSelectMetric: null,
};

ExperimentTableOverallGraph.propTypes = {
  className: PropTypes.string,
  experiments: PropTypes.arrayOf(PropTypes.shape({

  })),
  small: PropTypes.bool,
  currentMetric: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  onSelectMetric: PropTypes.func,
};

export default ExperimentTableOverallGraph;
