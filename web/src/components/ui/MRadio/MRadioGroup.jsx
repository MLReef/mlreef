import React from 'react';
import PropTypes from 'prop-types';
import MRadio from './MRadio';
import './MRadioGroup.scss';

const MRadioGroup = (props) => {
  const {
    label,
    options,
    name,
    value,
    footer,
    onChange,
    direction,
  } = props;

  const handleChange = (e, disabled = false) => {
    if (disabled) {
      return disabled;
    }

    const val = e?.currentTarget?.value || e;

    return onChange(val);
  };

  return (
    <div className="m-radio-group">
      { label && <div className="m-radio-group_label">{ label }</div> }
      <div className="m-radio-group_container" style={{ flexDirection: direction === 1 || undefined ? 'row' : 'column' }}>
        {
          (options || []).map((opt) => (
            <button
              type="button"
              key={`rad-opt-${opt.value}`}
              className="m-radio-group_option"
              onClick={() => handleChange(opt.value, opt.disabled)}
            >
              <MRadio
                name={name}
                checked={value === opt.value}
                value={opt.value}
                onChange={handleChange}
                disabled={opt.disabled}
              />
              <label htmlFor={name + value} className="m-radio-group_option_label">
                { opt.label }
              </label>
            </button>
          ))
        }
        { footer && <div className="m-select_footer">{ footer }</div> }
      </div>
    </div>
  );
};

MRadioGroup.defaultProps = {
  label: null,
  footer: null,
  direction: undefined,
};

MRadioGroup.propTypes = {
  label: PropTypes.string,
  options: PropTypes
    .arrayOf(PropTypes.shape({
      label: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node,
      ]),
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
  direction: PropTypes.number,
  onChange: PropTypes.func.isRequired,
};

export default MRadioGroup;
