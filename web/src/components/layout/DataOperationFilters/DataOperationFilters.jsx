import React from 'react';
import PropTypes from 'prop-types';
import './DataOperationFilters.scss';
import Input from 'components/input/input';

const DataOperationFilters = (props) => {
  const {
    className,
    show,
    handleCheckMarkClick,
  } = props;

  return (
    <div id="filters" className={`${className} data-operation-filters ${!show ? 'd-none' : ''}`}>
      <select className="data-operations-select round-border-button">
        <option>All data types</option>
        <option>Images data</option>
        <option>Text data</option>
        <option>Tabular data</option>
      </select>

      <div className="checkbox-zone">
        <label htmlFor="checkBoxOwnDataOperations" className="customized-checkbox">
          Only own data operations
          <input
            type="checkbox"
            onChange={handleCheckMarkClick}
            id="checkBoxOwnDataOperations"
          />
          <span className="checkmark" />
        </label>
        <label htmlFor="checkBoxStarredDataOperations" className="customized-checkbox">
          Only starred data operations
          <input
            type="checkbox"
            onChange={handleCheckMarkClick}
            id="checkBoxStarredDataOperations"
          />
          <span className="checkmark" />
        </label>
      </div>
      <Input name="minOfStart" id="minOfStart" placeholder="Minimum of stars" />
    </div>
  );
};

DataOperationFilters.defaultProps = {
  className: '',
  show: true,
};

DataOperationFilters.propTypes = {
  className: PropTypes.string,
  show: PropTypes.bool,
  handleCheckMarkClick: PropTypes.func.isRequired,
};

export default DataOperationFilters;
