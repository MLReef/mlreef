import React from 'react';
import PropTypes from 'prop-types';
import './MSelect.css';

const MSelect = (props) => {
  const {
    options,
    label,
    footer,
    value,
    onChange,
  } = props;

  const handleChange = (e) => {
    const target = e.currentTarget;
    const val = target && target.value;

    return onChange(val);
  };

  return (
    <div className="m-select">
      <div className="m-select_container">
        { label && <label htmlFor={label}>{ label }</label> }
        <select
          id={label}
          className="m-select_input"
          value={value}
          onChange={handleChange}
        >
          {
            (options || []).map((opt) => (
              <option
                key={`opt-${opt.value}`}
                value={opt.value}
              >
                { opt.label }
              </option>
            ))
          }
        </select>
        { footer && <div className="m-select_footer">{ footer }</div> }
      </div>
    </div>
  );
};

MSelect.defaultProps = {
  label: null,
  footer: null,
};

MSelect.propTypes = {
  label: PropTypes.string,
  options: PropTypes
    .arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.any,
    }))
    .isRequired,
  value: PropTypes
    .oneOfType([
      PropTypes.string,
      PropTypes.number,
    ])
    .isRequired,
  footer: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default MSelect;
