import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

const ExperimentTableCustomizeColumns = (props) => {
  const {
    className,
    selectedColIds,
    setSelectedColIds,
    allCols,
  } = props;

  const [expanded, setExpanded] = useState(false);

  const checkActive = useCallback(
    (label) => selectedColIds.some((x) => x === label.x),
    [selectedColIds],
  );

  const toggleDisplay = useCallback(
    (label) => () => {
      const nextActives = checkActive(label)
        ? selectedColIds.filter((x) => x !== label.x)
        : allCols.filter((c) => selectedColIds.concat(label.x).includes(c.x))
          .map((c) => c.x);

      setSelectedColIds(nextActives);
    },
    [checkActive, selectedColIds, allCols, setSelectedColIds],
  );

  return (
    <div className={cx('experiment-table-customize-columns', className)}>
      <button
        type="button"
        className={cx('btn btn-outline-dark btn-sm px-3', { active: expanded })}
        onClick={() => setExpanded(!expanded)}
      >
        Customize columns
      </button>
      <div className={cx('experiment-table-customize-columns-box', { expanded })}>
        <div className="experiment-table-customize-columns-box-container">
          {allCols.map((label) => (
            <button
              key={`allCols-${label.value}`}
              type="button"
              title={label.type}
              onClick={toggleDisplay(label)}
              className={cx(
                'experiment-table-customize-columns-box-btn btn btn-sm btn-outline-dark',
                { active: checkActive(label) },
              )}
            >
              {label.value}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

ExperimentTableCustomizeColumns.defaultProps = {
  className: '',
};

ExperimentTableCustomizeColumns.propTypes = {
  className: PropTypes.string,
  allCols: PropTypes.arrayOf(PropTypes.shape).isRequired,
  selectedColIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  setSelectedColIds: PropTypes.func.isRequired,
};

export default ExperimentTableCustomizeColumns;
