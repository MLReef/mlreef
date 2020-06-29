import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import './MSelect.scss';

const MSelect = (props) => {
  const {
    label,
    variant,
    disabled,
    value,
    options,
    onSelect,
    minimal,
  } = props;

  const selected = useMemo(() => {
    const option = options.find((opt) => opt.value === value);
    return option && option.label;
  }, [value, options]);

  const [optionsShown, setOptionsShown] = useState(false);

  const toggleShowOptions = () => {
    setOptionsShown(!optionsShown);
  };

  const handleSelect = (val) => () => {
    setOptionsShown(false);
    return onSelect(val);
  };

  return (
    <div className={`m-select m-dropdown ${optionsShown ? 'show' : ''} ${minimal ? 'minimal' : ''}`}>
      <div className="m-select-button m-dropdown-button">
        <button
          type="button"
          disabled={disabled}
          className={`btn btn-outline-${variant} d-flex ${!minimal ? 'w-100' : ''}`}
          onClick={toggleShowOptions}
        >
          <span>{selected || label}</span>
          <i className="fa fa-chevron-down ml-auto my-auto mr-0" />
        </button>
      </div>
      <div className="m-select-list-container container-shadow border-rounded m-dropdown-list-container">
        <ul className="m-select-list m-dropdown-list">
          {options.map((opt) => (
            // eslint-disable-next-line
            <li
              key={`${opt.label}-{${opt.value}}`}
              className="m-select-list-item m-dropdown-list-item"
              onClick={handleSelect(opt.value)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
MSelect.defaultProps = {
  variant: 'dark',
  label: 'select...',
  options: [],
  value: '',
  disabled: false,
  minimal: false,
};

MSelect.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.bool,
    ]),
  })),
  variant: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.bool,
  ]),
  onSelect: PropTypes.func.isRequired,
  minimal: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default MSelect;
