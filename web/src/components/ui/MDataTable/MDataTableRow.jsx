import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import * as pt from './propTypes';
import { round } from './functions';

const MDataTable = (props) => {
  const {
    cols,
    id,
    index,
    editable,
    onFieldChange,
    onDeleteRow,
    actives,
    decimals,
  } = props;

  const handleDeleteRow = useCallback(
    (rowId) => (e) => {
      e.target.closest('tr').classList.add('deleting');
      setTimeout(() => {
        onDeleteRow(rowId);
      }, 200);
    },
    [onDeleteRow],
  );

  const toggleEdit = (e) => {
    const td = e.target.closest('td');
    td.classList.toggle('edit');
    if (td.querySelector('input')) td.querySelector('input').select();
  };

  const stopEdit = (e) => {
    e.target.value = e.target.defaultValue;
    e.target.closest('td').classList.remove('edit');
  };

  const handleInput = useCallback(
    (x, y) => (e) => {
      if (e.key === 'Escape') {
        e.target.value = e.target.defaultValue;
        e.target.closest('td').classList.remove('edit');
      }

      if (e.key === 'Enter' || e.key === 'Tab') {
        onFieldChange({ x, y, value: e.target.value });
        e.target.closest('td').classList.remove('edit');
      }
    },
    [onFieldChange],
  );

  return (
    <tr data-row={id}>
      <td data-row={id} data-col="index">
        {index}
      </td>
      {cols.map((field) => (
        // eslint-disable-next-line
        <td
          key={`td-${field.y}-${field.x}`}
          data-type="field"
          data-row={field.y}
          data-col={field.x}
          className={cx({ editable, active: actives.includes(field.x) })}
          onDoubleClick={toggleEdit}
        >
          <span className="m-data-table-field">
            {round(decimals)(field.value)}
          </span>
          {onFieldChange && editable && (
            <input
              type="text"
              className="m-data-table-input"
              defaultValue={field.value}
              onBlur={stopEdit}
              onKeyDown={handleInput(field.x, field.y)}
            />
          )}
        </td>
      ))}
      <td data-row={id} data-col="actions" className="m-data-table-actions-cell">
        {onDeleteRow && (
          <button
            type="button"
            label="delete"
            className="btn fa fa-times m-data-table-actions-cell-btn"
            onClick={handleDeleteRow(id)}
          />

        )}
      </td>
    </tr>
  );
};

MDataTable.defaultProps = {
  actives: [],
  editable: false,
  onDeleteRow: null,
  onFieldChange: null,
};

MDataTable.propTypes = {
  id: PropTypes.number.isRequired,
  cols: pt.cols.isRequired,
  index: PropTypes.number.isRequired,
  actives: pt.actives,
  onFieldChange: PropTypes.func,
  onDeleteRow: PropTypes.func,
  editable: PropTypes.bool,
  decimals: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
};

export default MDataTable;
