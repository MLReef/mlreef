import React, { useCallback, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { sortAsc, sortDesc } from 'components/ui/MDataTable/functions';
import ExperimentTableRow from './ExperimentTableRow';
import ExperimentTableFilters from './ExperimentTableFilters';
import ExperimentTableCustomizeColumns from './ExperimentTableCustomizeColumns';
import './ExperimentTable.scss';

const sorters = {
  sortAsc,
  sortDesc,
};

const initCols = (cols) => cols.filter((c) => c.type !== 'parameter')
  .map((c) => c.x);

const ExperimentTable = (props) => {
  const {
    className,
    richData,
  } = props;

  const [decimals, setDecimals] = useState(4);
  const [menuShown, setMenuShown] = useState(false);
  const [mods, setMods] = useState([null, null]);
  const [header, setHeader] = useState(richData.data[0]);
  const [selectedColIds, setSelectedColIds] = useState(initCols(header.cols));
  const [data, setData] = useState(richData.data.slice(1));
  const [filteredRows, setFilteredRows] = useState(data);

  const filterSelectedCols = useCallback(
    (cols) => selectedColIds.map((id) => cols.find((c) => c.x === id)),
    [selectedColIds],
  );

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
      return transform ? transform(filteredRows) : filteredRows;
    },
    [filteredRows, mods],
  );

  const actives = [
    { color: '#CC88FF', cols: [4, 6] },
  ];

  return (
    <div className={cx('experiment-table-container', className)}>
      <div className="experiment-table-header">
        <ExperimentTableFilters
          rows={data}
          setFilteredRows={setFilteredRows}
        />
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
              <th data-col="actions" label="actions-label" />

              {filterSelectedCols(header.cols).map((th) => (
                <th
                  key={`thead-${th.x}`}
                  data-col={th.x}
                  title="Click to sort"
                  onClick={toggleSort(th.x)}
                  className="experiment-table-header-cell"
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
            {displayedData.map(({ cols, id }, i) => (
              <ExperimentTableRow
                key={`tr-${id}`}
                id={id}
                cols={filterSelectedCols(cols)}
                index={i}
                actives={actives}
                decimals={decimals}
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
};

ExperimentTable.propTypes = {
  className: PropTypes.string,
  richData: PropTypes.shape({
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
  }).isRequired,
};

export default ExperimentTable;
