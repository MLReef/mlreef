import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import * as pt from './propTypes';
import { sortAsc, sortDesc } from './functions';
import './MDataTable.scss';

const sorters = {
  sortAsc,
  sortDesc,
};

const MDataTableBase = (props) => {
  const {
    className,
    data,
    editable,
    onFieldChange,
    onDeleteRow,
    actives,
    MenuComponent,
    RowComponent,
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
                <MenuComponent
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
              <RowComponent
                key={`tr-${id}`}
                id={id}
                cols={cols}
                index={i}
                onFieldChange={onFieldChange}
                onDeleteRow={onDeleteRow}
                actives={actives}
                editable={editable}
                decimals={decimals}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

MDataTableBase.defaultProps = {
  className: '',
  actives: [],
  editable: false,
  onDeleteRow: null,
  onFieldChange: null,
};

MDataTableBase.propTypes = {
  className: PropTypes.string,
  data: pt.data.isRequired,
  onFieldChange: PropTypes.func,
  onDeleteRow: PropTypes.func,
  actives: pt.actives,
  editable: PropTypes.bool,
  MenuComponent: PropTypes.func.isRequired,
  RowComponent: PropTypes.func.isRequired,
};

export default MDataTableBase;
