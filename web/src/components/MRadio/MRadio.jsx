import React from 'react';
import PropTypes from 'prop-types';
import './MRadio.css';

const MRadio = (props) => {
  const {
    label,
    options,
    name,
    value,
    footer,
    onChange,
  } = props;

  const handleChange = (e) => {
    const target = e.currentTarget;
    const val = target && target.value;

    return onChange(val);
  };

  return (
    <div className="m-radio">
      { label && <div className="m-radio_label">{ label }</div> }
      <div className="m-radio_container">
        {
          (options || []).map((opt) => (
            <div className="m-radio_option" key={`rad-opt-${opt.value}`}>
              <input
                id={name + value}
                className="m-radio_option_input"
                type="radio"
                name={name}
                checked={value === opt.value}
                onChange={handleChange}
                value={opt.value}
              />
              <label htmlFor={name + value} className="m-radio_option_label">
                { opt.label }
              </label>
            </div>
          ))
        }
        { footer && <div className="m-select_footer">{ footer }</div> }
      </div>
    </div>
  );
};

MRadio.defaultProps = {
  label: null,
  footer: null,
};

MRadio.propTypes = {
  label: PropTypes.string,
  options: PropTypes
    .arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.any,
    }))
    .isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes
    .oneOfType([
      PropTypes.string,
      PropTypes.number,
    ])
    .isRequired,
  footer: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default MRadio;
