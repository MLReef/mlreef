import React from 'react';
import PropTypes from 'prop-types';
import './MRadio.scss';

const MRadio = (props) => {
  const {
    id,
    name,
    value,
    checked,
    onChange,
    color,
    disabled,
  } = props;

  return (
    <div className="m-radio">
      <input
        id={id}
        className="m-radio-input"
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        value={value}
        disabled={disabled}
      />
      <span className={`checkmark ${color}`}><span /></span>
    </div>
  );
};

MRadio.defaultProps = {
  name: undefined,
  value: undefined,
  color: 'dark',
  id: undefined,
  disabled: false,
};

MRadio.propTypes = {
  name: PropTypes.string,
  id: PropTypes.string,
  color: PropTypes.string,
  value: PropTypes
    .oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
  checked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

export default MRadio;
