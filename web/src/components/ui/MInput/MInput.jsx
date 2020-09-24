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
    readOnly,
    styleClass,
    cypressTag,
  } = props;

  return (
    <div className={`m-input ${className}`}>
      <div className="m-input_container">
        <label htmlFor={id}>{ label }</label>
        <input
          id={id}
          data-cy={cypressTag}
          className={`m-input_input ${styleClass}`}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          readOnly={readOnly}
          min={min}
        />
        <div className="m-input_errors">
          {error && (
            <div data-cy="m-error" className="m-error">
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
  onChange: () => {},
  readOnly: false,
  styleClass: '',
  cypressTag: '',
};

MInput.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes
    .oneOfType([
      PropTypes.string,
      PropTypes.number,
    ])
    .isRequired,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
  ]),
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
  readOnly: PropTypes.bool,
  styleClass: PropTypes.string,
  cypressTag: PropTypes.string,
};

export default MInput;
