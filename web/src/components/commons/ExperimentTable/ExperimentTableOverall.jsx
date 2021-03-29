import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import ExperimentTableOverallGraph from './ExperimentTableOverallGraph';

const ExperimentTableOverall = (props) => {
  const {
    className,
    experiments,
    onUpdateExperiments,
    hiddenExpIds,
    store,
    actions,
  } = props;

  const [graphs, setGraphs] = useState([{ id: 1, currentMetric: '' }]);

  const featuredExperiments = useMemo(
    () => experiments.map((exp) => hiddenExpIds.includes(exp.id)
      ? ({ ...exp, hidden: true }) : exp),
    [experiments, hiddenExpIds],
  );

  const addGraph = useCallback(
    () => {
      setGraphs((gs) => gs.concat({ id: gs.length + 1, currentMetric: '' }));
    },
    [setGraphs],
  );

  const removeGraph = useCallback(
    (id) => () => {
      setGraphs((gs) => gs.filter((g) => g.id !== id));
    },
    [setGraphs],
  );

  const handleSelectMetric = useCallback(
    (id) => (metric) => {
      const nextGraphs = graphs.map((g) => g.id !== id ? g : ({ ...g, currentMetric: metric }));
      setGraphs(nextGraphs);
    },
    [graphs, setGraphs],
  );

  // load stored graphs (if exists) when mounting
  useEffect(
    () => {
      const storedGraphs = store.projects && store.projects[store.currentProjectId]?.graphs;

      if (storedGraphs && storedGraphs.length) {
        setGraphs(store.projects[store.currentProjectId].graphs);
      }
    },
    // do not include store.projects
    // eslint-disable-next-line
    [store.currentProjectId, setGraphs],
  );

  // save graphs in store (if exists)
  useEffect(
    () => {
      if (actions) actions.setGraphs(store.currentProjectId, graphs);
    },
    [store.currentProjectId, graphs, actions],
  );

  return (
    <div className={cx('experiment-table-overall', className)}>
      <div className="experiment-table-overall-menu">
        <button
          type="button"
          className="btn btn-hidden px-3 py-2 mr-0"
          onClick={onUpdateExperiments}
        >
          <i className="fa fa-redo mr-2" />
          Refresh
        </button>
        <button
          type="button"
          className="btn btn-hidden px-3 py-2 ml-2 mr-0"
          onClick={addGraph}
        >
          <i className="fa fa-plus mr-2" />
          Add panel
        </button>
      </div>
      <div className="experiment-table-overall-content">
        {graphs.map((graph, index) => (
          <ExperimentTableOverallGraph
            key={`graph-${graph.id}`}
            small={graphs.length > 1}
            experiments={featuredExperiments}
            currentMetric={graph.currentMetric}
            onClose={index ? removeGraph(graph.id) : undefined}
            onSelectMetric={handleSelectMetric(graph.id)}
          />
        ))}
      </div>
    </div>
  );
};

ExperimentTableOverall.defaultProps = {
  className: '',
  experiments: [],
  hiddenExpIds: [],
  store: {},
  actions: null,
};

ExperimentTableOverall.propTypes = {
  className: PropTypes.string,
  experiments: PropTypes.arrayOf(PropTypes.shape({

  })),
  onUpdateExperiments: PropTypes.func.isRequired,
  hiddenExpIds: PropTypes.arrayOf(PropTypes.string),
  store: PropTypes.shape({
    projects: PropTypes.shape({}),
    currentProjectId: PropTypes.string,
  }),
  actions: PropTypes.shape({
    setGraphs: PropTypes.func.isRequired,
  }),
};

export default ExperimentTableOverall;
