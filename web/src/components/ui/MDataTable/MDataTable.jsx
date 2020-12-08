import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import MDataTableMenu from './MDataTableMenu';
import { sortAsc, sortDesc, round } from './functions';
import './MDataTable.scss';

const sorters = {
  sortAsc,
  sortDesc,
};

const MDataTable = (props) => {
  const {
    className,
    data,
    editable,
    onFieldChange,
    onDeleteRow,
    actives,
  } = props;

  const [decimals, setDecimals] = useState('');
  const [menuShown, setMenuShown] = useState(false);
  const [mods, setMods] = useState([null, null]);

  const toggleSort = (x) => () => {
    const [action, col] = mods;

    if (col === x) {
      if (action === 'sortDesc') return setMods(['sortAsc', x]);
      if (action === 'sortAsc') return setMods([null, null]);
    }

    return setMods(['sortDesc', x]);
  };

  const displayedData = useMemo(
    () => {
      const [action, col] = mods;

      const transform = action && sorters[action](col);
      return transform ? transform(data.slice(1)) : data.slice(1);
    },
    [data, mods],
  );

  const handleDeleteRow = useCallback(
    (id) => (e) => {
      e.target.closest('tr').classList.add('deleting');
      setTimeout(() => {
        onDeleteRow(id);
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
    <div className={cx('m-data-table-container', className)}>
      {data.length > 0 && (
        <table className="m-data-table">
          <thead>
            <tr data-row="header">
              <th data-col="index">
                N
              </th>
              {data[0].cols.map((th) => (
                <th
                  key={`thead-${th.x}`}
                  data-col={th.x}
                  title="Click to sort"
                  onClick={toggleSort(th.x)}
                  className="m-data-table-header-cell"
                  style={{
                    backgroundColor: actives.find((a) => a.cols.includes(th.x))?.color,
                  }}
                >
                  <span className="m-data-table-header-cell-label">
                    {th.value}
                  </span>
                  <i className={cx('fa', {
                    'fa-sort-up': mods[1] === th.x && mods[0] === 'sortAsc',
                    'fa-sort-down': mods[1] === th.x && mods[0] === 'sortDesc',
                  })}
                  />
                </th>
              ))}
              <th data-col="actions">
                {/* eslint-disable-next-line */}
                <i onClick={() => setMenuShown(true)} className="fa fa-bars px-3" />
                <MDataTableMenu
                  className={cx({ open: menuShown })}
                  onClose={() => setMenuShown(false)}
                  decimals={decimals}
                  setDecimals={setDecimals}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedData.map(({ cols, id }, i) => (
              // eslint-disable-next-line
              <tr key={`tr-${id}`} data-row={id}>
                <td data-row={id} data-col="index">
                  {i}
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
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

MDataTable.defaultProps = {
  className: '',
  actives: [],
  editable: false,
  onDeleteRow: null,
  onFieldChange: null,
};

MDataTable.propTypes = {
  className: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    cols: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
      ]),
    })),
  })).isRequired,
  onFieldChange: PropTypes.func,
  onDeleteRow: PropTypes.func,
  actives: PropTypes.arrayOf(PropTypes.shape({
    color: PropTypes.string,
    cols: PropTypes.arrayOf(PropTypes.number),
  })),
  editable: PropTypes.bool,
};

export default MDataTable;
