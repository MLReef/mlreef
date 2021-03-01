import React, {
  useCallback,
  useState,
  useMemo,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { sortAsc, sortDesc } from 'components/ui/MDataTable/functions';
import MCheckBox from 'components/ui/MCheckBox/MCheckBox';
import ExperimentTableRow from './ExperimentTableRow';
import ExperimentTableFilters from './ExperimentTableFilters';
import ExperimentTableCustomizeColumns from './ExperimentTableCustomizeColumns';
import './ExperimentTable.scss';
import parseExperiments from './adapters';

const sorters = {
  sortAsc,
  sortDesc,
};

const initCols = (cols) => cols.filter((c) => c.type !== 'metric')
  .map((c) => c.x);

const ExperimentTable = (props) => {
  const {
    className,
    style,
    experiments,
    onDeleteExperiments,
    onStopExperiments,
    onUpdateExperiments,
  } = props;

  const dataTable = useMemo(
    () => parseExperiments(experiments),
    [experiments],
  );

  const data = useMemo(() => dataTable.slice(1), [dataTable]);

  const [decimals] = useState(4);

  const [mods, setMods] = useState([null, null]);
  const [header] = useState(dataTable[0]);
  const [selectedColIds, setSelectedColIds] = useState(initCols(header.cols));
  const [filteredRows, setFilteredRows] = useState(data);
  const [selectedRows, setSelectedRows] = useState([]);

  const filterSelectedCols = useCallback(
    (cols) => selectedColIds.map((id) => cols.find((c) => c.x === id)),
    [selectedColIds],
  );

  const toggleSelected = (id, status) => setSelectedRows((rows) => status
    ? rows.concat(id)
    : rows.filter((r) => r !== id));

  const toggleSelectAll = (n, l, status) => setSelectedRows(() => status
    ? experiments.map((exp) => exp.id)
    : []);

  // console.log('f', selectedColIds, filterSelectedCols(data));
  const toggleSort = (x) => () => {
    const [action, col] = mods;

    if (col === x) {
      if (action === 'sortDesc') return setMods(['sortAsc', x]);
      if (action === 'sortAsc') return setMods([null, null]);
    }

    return setMods(['sortDesc', x]);
  };

  const handleDeleteExperiments = () => {
    onDeleteExperiments(selectedRows);
  };

  const handleStopExperiments = () => {
    const runningExpIds = experiments
      .filter((exp) => (exp.status === 'running') || exp.status === 'pending')
      .map((exp) => exp.id);

    onStopExperiments(selectedRows.filter((r) => runningExpIds.includes(r)));
  };

  const displayedData = useMemo(
    () => {
      const [action, col] = mods;

      const transform = action && sorters[action](col);
      return transform ? transform(filteredRows) : filteredRows;
    },
    [filteredRows, mods],
  );

  const actives = [
    // { color: '#CC88FF', cols: [4, 6] },
  ];

  // update table when info change
  useEffect(() => { setFilteredRows(data); }, [data]);

  return (
    <div className={cx('experiment-table-container', className)} style={style}>
      <div className="experiment-table-header">
        <ExperimentTableFilters
          rows={data}
          setFilteredRows={setFilteredRows}
        />
        <div className="experiment-table-btn-group">
          {selectedRows.length > 0 && (
            <button
              type="button"
              label="delete"
              className="experiment-table-btn delete fa fa-times border-rounded"
              onClick={handleDeleteExperiments}
            />
          )}
          {selectedRows.length > 0 && (
            <button
              type="button"
              label="stop"
              className="experiment-table-btn stop fa fa-stop border-rounded"
              onClick={handleStopExperiments}
            />
          )}
          <button
            type="button"
            label="update"
            className="experiment-table-btn reload fa fa-redo border-rounded"
            onClick={onUpdateExperiments}
          />
        </div>
        <ExperimentTableCustomizeColumns
          allCols={header.cols}
          selectedColIds={selectedColIds}
          setSelectedColIds={setSelectedColIds}
        />
      </div>
      {data.length > 0 && (
        <table className="experiment-table">
          <thead>
            <tr data-row="header">
              <th data-col="index" className="experiment-table-row-cell">
                N
              </th>
              <th data-col="actions" label="actions-label" className="border-rounded-left">
                <MCheckBox
                  small
                  name="all"
                  callback={toggleSelectAll}
                  checked={selectedRows.length === experiments.length}
                />
              </th>

              {filterSelectedCols(header.cols).map((th, index, arr) => (
                <th
                  key={`thead-${th.x}`}
                  data-col={th.x}
                  title="Click to sort"
                  onClick={toggleSort(th.x)}
                  className={cx('experiment-table-header-cell', {
                    active: mods[1] === th.x && mods[0],
                    'border-rounded-right': arr.length - 1 === index,
                  })}
                  style={{
                    backgroundColor: actives.find((a) => a.cols.includes(th.x))?.color,
                  }}
                >
                  <span className="experiment-table-header-cell-label">
                    {th.value}
                  </span>
                  <i className={cx('fa', {
                    'fa-sort-up': mods[1] === th.x && mods[0] === 'sortAsc',
                    'fa-sort-down': mods[1] === th.x && mods[0] === 'sortDesc',
                  })}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedData.map(({ cols, id, uuid }, i) => (
              <ExperimentTableRow
                key={`tr-${id}`}
                id={id}
                uuid={uuid}
                cols={filterSelectedCols(cols)}
                index={i}
                actives={actives}
                decimals={decimals}
                experiments={experiments}
                selectedRows={selectedRows}
                onSelection={toggleSelected}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

ExperimentTable.defaultProps = {
  className: '',
  style: {},
};

ExperimentTable.propTypes = {
  className: PropTypes.string,
  style: PropTypes.shape({}),
  experiments: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    authorName: PropTypes.string.isRequired,
    pipelineJobInfo: PropTypes.shape({
      createdAt: PropTypes.string.isRequired,
    }),
    processing: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
    jsonBlob: PropTypes.string,
  })).isRequired,
  onDeleteExperiments: PropTypes.func.isRequired,
  onStopExperiments: PropTypes.func.isRequired,
  onUpdateExperiments: PropTypes.func.isRequired,
};

export default ExperimentTable;
