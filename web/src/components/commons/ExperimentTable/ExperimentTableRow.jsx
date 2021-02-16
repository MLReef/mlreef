import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Link, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { round } from 'components/ui/MDataTable/functions';
import * as pt from 'components/ui/MDataTable/propTypes';
import MCheckBox from 'components/ui/MCheckBox/MCheckBox';
import { getPipelineIcon } from 'functions/pipeLinesHelpers';
import ExperimentTableRowPanel from './ExperimentTableRowPanel';

const getHours = (secs) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const pad = (n) => `${n}`.padStart(2, '0');

  return `${h}:${pad(m)}:${pad(s)}`;
};

const ExperimentTableRow = (props) => {
  const {
    cols,
    id,
    uuid,
    index,
    actives,
    decimals,
    experiments,
    selectedRows,
    onSelection,
  } = props;

  const { pathname } = useLocation();

  const [panelExpanded, setPanelExpanded] = useState(false);

  const selected = useMemo(
    () => selectedRows.includes(uuid),
    [selectedRows, uuid],
  );

  const featuredCols = useMemo(
    () => ({
      status: cols.find((c) => c.type === 'status'),
      label: cols.find((c) => c.type === 'label'),
      finished: cols.find((c) => c.type === 'timestamp'),
      duration: cols.find((c) => c.type === 'time'),
      user: cols.find((c) => c.type === 'user'),
      model: cols.find((c) => c.type === 'model'),
      metrics: cols.filter((c) => c.type === 'metric'),
    }),
    [cols],
  );

  return (
    <>
      <tr className={cx('experiment-table-row', { selected })} data-row={id}>
        <td data-row={id} data-col="index" className="experiment-table-row-cell">
          {index}
        </td>
        <td data-row={id} data-col="actions" className="experiment-table-row-cell">
          <div className="experiment-table-action">
            <MCheckBox
              small
              name={uuid}
              className="experiment-table-action-selector"
              checked={selected}
              callback={(name, _, status) => onSelection(name, status)}
            />
            <button
              type="button"
              label="toggle"
              className={cx(
                `fa-chevron-${panelExpanded ? 'up' : 'down'}`,
                'btn fa experiment-table-action-btn',
              )}
              onClick={() => setPanelExpanded(!panelExpanded)}
            />
            <button
              type="button"
              label="toggle"
              className="btn fa fa-eye experiment-table-action-btn"
            />
          </div>
        </td>
        {featuredCols.status && (
          <td
            data-row={id}
            data-col="status"
            className="experiment-table-row-cell"
          >
            <div className="d-flex" title={featuredCols.status.value}>
              <img
                src={getPipelineIcon(featuredCols.status.value)}
                alt={featuredCols.status.value}
              />
            </div>
          </td>
        )}

        {featuredCols.label && (
          <td
            className="experiment-table-row-cell"
            data-row={id}
            data-col="label"
          >
            <div className="d-flex">
              <span
                className="label-color"
                style={{ backgroundColor: featuredCols.label.color }}
              />
              <Link to={`${pathname}/${uuid}`}>
                <span className="label-text">
                  {featuredCols.label.value.replace('experiment/', '')}
                </span>
              </Link>
            </div>
          </td>
        )}
        {featuredCols.user && (
          <td
            className="experiment-table-row-cell"
            data-row={id}
            data-col="user"
          >
            <Link to={`/${featuredCols.user.value}`}>
              {featuredCols.user.value}
            </Link>
          </td>
        )}

        {featuredCols.model && (
          <td
            className="experiment-table-row-cell"
            data-row={id}
            data-col="user"
          >
            {featuredCols.model.value}
          </td>
        )}

        {featuredCols.finished && (
          <td
            className="experiment-table-row-cell"
            data-row={id}
            data-col="finished"
            data-value={featuredCols.finished.value}
          >
            {dayjs(featuredCols.finished.value).format('DD.MM.YYYY - HH:mm')}
          </td>
        )}

        {featuredCols.duration && (
          <td
            className="experiment-table-row-cell"
            data-row={id}
            data-col="duration"
            data-value={featuredCols.duration.value}
          >
            {getHours(featuredCols.duration.value)}
          </td>
        )}

        {featuredCols.metrics.map((field) => (
          // eslint-disable-next-line
          <td
            key={`td-${field.y}-${field.x}`}
            data-type="field"
            data-row={field.y}
            data-col={field.x}
            className={cx('experiment-table-row-cell', { active: actives.includes(field.x) })}
          >
            <span className="experiment-table-field">
              {/* eslint-disable-next-line */}
              {isNaN(field.value) ? field.value : round(decimals)(field.value)}
            </span>
          </td>
        ))}
      </tr>

      {panelExpanded && (
        <tr>
          <td colSpan={cols.length + 2} className="bg-light px-3">
            <ExperimentTableRowPanel currentId={uuid} experiments={experiments} />
          </td>
        </tr>
      )}
    </>
  );
};

ExperimentTableRow.defaultProps = {
  actives: [],
};

ExperimentTableRow.propTypes = {
  id: PropTypes.number.isRequired,
  uuid: PropTypes.string.isRequired,
  cols: pt.cols.isRequired,
  index: PropTypes.number.isRequired,
  actives: pt.actives,
  decimals: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  experiments: PropTypes.arrayOf(PropTypes.shape).isRequired,
  selectedRows: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelection: PropTypes.func.isRequired,
};

export default ExperimentTableRow;
