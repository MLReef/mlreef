import React from 'react';
import propTypes from 'prop-types';
import cx from 'classnames';

const ExperimentTableRowPanel = (props) => {
  const {
    className,
  } = props;

  return (
    <div className={cx('experiment-table-row-panel', className)}>
      TODOs
    </div>
  );
};

ExperimentTableRowPanel.defaultProps = {
  className: '',
};

ExperimentTableRowPanel.propTypes = {
  className: propTypes.string,
};

export default ExperimentTableRowPanel;
