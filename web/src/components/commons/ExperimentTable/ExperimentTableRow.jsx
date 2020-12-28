import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import dayjs from 'dayjs';
import { round } from 'components/ui/MDataTable/functions';
import * as pt from 'components/ui/MDataTable/propTypes';
import { getPipelineIcon } from 'functions/pipeLinesHelpers';
import ExperimentTableRowPanel from './ExperimentTableRowPanel';

const ExperimentTableRow = (props) => {
  const {
    cols,
    id,
    index,
    actives,
    decimals,
  } = props;

  const [panelExpanded, setPanelExpanded] = useState(false);

  const statusCol = cols.find((c) => c.type === 'status');
  const labelCol = cols.find((c) => c.type === 'label');
  const finishedCol = cols.find((c) => c.type === 'timestamp');
  const durationCol = cols.find((c) => c.type === 'time');
  const parameterCols = cols.filter((c) => c.type === 'parameter');

  const getHours = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const pad = (n) => `${n}`.padStart(2, '0');

    return `${h}:${pad(m)}:${pad(s)}`;
  };

  return (
    <>
      <tr className="experiment-table-row" data-row={id}>
        <td data-row={id} data-col="index" className="experiment-table-row-cell">
          {index}
        </td>
        <td data-row={id} data-col="actions" className="experiment-table-row-cell">
          <div className="experiment-table-action">
            <button
              type="button"
              label="select"
              className="btn fa fa-bars experiment-table-action-btn"
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
        {statusCol && (
          <td
            data-row={id}
            data-col="status"
            className="experiment-table-row-cell"
          >
            <div className="d-flex">
              <img src={getPipelineIcon(statusCol.value)} alt={statusCol.value} />
            </div>
          </td>
        )}

        {labelCol && (
          <td
            className="experiment-table-row-cell"
            data-row={id}
            data-col="label"
          >
            <div className="d-flex">
              <span
                className="label-color"
                style={{ backgroundColor: labelCol.color }}
              />
              <span className="label-text">
                {labelCol.value}
              </span>
            </div>
          </td>
        )}

        {finishedCol && (
          <td
            className="experiment-table-row-cell"
            data-row={id}
            data-col="finished"
            data-value={finishedCol.value}
          >
            {dayjs(finishedCol.value).format('DD.MM.YYYY - HH:mm')}
          </td>
        )}

        {durationCol && (
          <td
            className="experiment-table-row-cell"
            data-row={id}
            data-col="duration"
            data-value={durationCol.value}
          >
            {getHours(durationCol.value)}
          </td>
        )}

        {parameterCols.map((field) => (
          // eslint-disable-next-line
          <td
            key={`td-${field.y}-${field.x}`}
            data-type="field"
            data-row={field.y}
            data-col={field.x}
            className={cx('experiment-table-row-cell', { active: actives.includes(field.x) })}
          >
            <span className="experiment-table-field">
              {round(decimals)(field.value)}
            </span>
          </td>
        ))}
      </tr>

      {panelExpanded && (
        <tr>
          <td colSpan={cols.length + 2} className="bg-secondary">
            <ExperimentTableRowPanel />
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
  cols: pt.cols.isRequired,
  index: PropTypes.number.isRequired,
  actives: pt.actives,
  decimals: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
};

export default ExperimentTableRow;
