import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

const getStatus = (row) => row.cols.find((c) => c.type === 'status')?.value;

const filterRowsByStatus = (rs, status) => rs.filter((r) => getStatus(r) === status);

const ExperimentTableFilters = (props) => {
  const {
    className,
    rows,
    setFilteredRows,
  } = props;

  const [active, setActive] = useState('all');

  const handleClick = useCallback(
    (label) => () => {
      setActive(label);
      if (label === 'all') return setFilteredRows(rows);

      const rest = rows.filter((r) => r.cols
        .find((c) => c.type === 'status').value === label);

      return setFilteredRows(rest);
    },
    [rows, setActive, setFilteredRows],
  );

  const counter = useMemo(
    () => ({
      all: rows.length,
      running: filterRowsByStatus(rows, 'running').length,
      success: filterRowsByStatus(rows, 'success').length,
      failed: filterRowsByStatus(rows, 'failed').length,
      cancelled: filterRowsByStatus(rows, 'cancelled').length,
    }),
    [rows],
  );

  return (
    <div className={cx('experiment-table-filters', className)}>
      <button
        type="button"
        className={cx('btn btn-switch btn-sm mr-2 px-3', { active: active === 'all' })}
        onClick={handleClick('all')}
      >
        <span className="mr-1">
          {counter.all}
        </span>
        <span className="experiment-table-filters-btn-label">
          All
        </span>
      </button>
      <button
        type="button"
        className={cx('btn btn-switch btn-sm mr-2 px-3', { active: active === 'running' })}
        onClick={handleClick('running')}
      >
        <span className="mr-1">
          {counter.running}
        </span>
        <span className="experiment-table-filters-btn-label">
          Running
        </span>
      </button>
      <button
        type="button"
        className={cx('btn btn-switch btn-sm mr-2 px-3', { active: active === 'success' })}
        onClick={handleClick('success')}
      >
        <span className="mr-1">
          {counter.success}
        </span>
        <span className="experiment-table-filters-btn-label">
          Completed
        </span>
      </button>
      <button
        type="button"
        className={cx('btn btn-switch btn-sm mr-2 px-3', { active: active === 'failed' })}
        onClick={handleClick('failed')}
      >
        <span className="mr-1">
          {counter.failed}
        </span>
        <span className="experiment-table-filters-btn-label">
          Failed
        </span>
      </button>
      <button
        type="button"
        className={cx('btn btn-switch btn-sm mr-2 px-3', { active: active === 'cancelled' })}
        onClick={handleClick('cancelled')}
      >
        <span className="mr-1">
          {counter.cancelled}
        </span>
        <span className="experiment-table-filters-btn-label">
          Cancelled
        </span>
      </button>
    </div>
  );
};

ExperimentTableFilters.defaultProps = {
  className: '',
};

ExperimentTableFilters.propTypes = {
  className: PropTypes.string,
  rows: PropTypes.arrayOf(PropTypes.shape({
    cols: PropTypes.arrayOf(PropTypes.shape),
  })).isRequired,
  setFilteredRows: PropTypes.func.isRequired,
};

export default ExperimentTableFilters;
