import React from 'react';
import PropTypes from 'prop-types';
import './MInput.css';

const MInput = (props) => {
  const {
    id,
    value,
    onChange,
    onBlur,
    error,
    label,
    type,
    placeholder,
    min,
    className,
  } = props;

  return (
    <div className={`m-input ${className}`}>
      <div className="m-input_container">
        <label htmlFor={id}>{ label }</label>
        <input
          id={id}
          className="m-input_input"
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          min={min}
        />
        <div className="m-input_errors">
          {error && (
            <div className="m-error">
              { error }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

MInput.defaultProps = {
  error: null,
  label: '',
  type: 'text',
  placeholder: null,
  min: undefined,
  className: '',
  onBlur: () => {},
};

MInput.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes
    .oneOfType([
      PropTypes.string,
      PropTypes.number,
    ])
    .isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  label: PropTypes
    .oneOfType([
      PropTypes.string,
      PropTypes.node,
    ]),
  min: PropTypes
    .oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
  className: PropTypes.string,
};

export default MInput;
