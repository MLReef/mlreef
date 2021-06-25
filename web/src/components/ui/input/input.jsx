import React, { Component } from 'react';
import './input.css';
import { string, func } from 'prop-types';

class Input extends Component {
  constructor(props) {
    super(props);
    const { value } = this.props;
    this.state = {
      currentValue: value,
    };
    this.onChange = this.onChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  onBlur(e) {
    const { onBlurCallback } = this.props;

    if (onBlurCallback && typeof onBlurCallback === 'function') {
      onBlurCallback(e);
    }
  }

  onChange(e) {
    const { callback } = this.props;
    this.setState({
      currentValue: e.currentTarget.value,
    });
    if (e.currentTarget.value) {
      e.currentTarget.classList.remove('grey-border');
      e.currentTarget.classList.add('blue-border-dark-blue-letter');
    } else {
      e.currentTarget.classList.remove('blue-border-dark-blue-letter');
      e.currentTarget.classList.add('grey-border');
    }

    if (callback && typeof callback === 'function') {
      callback(e);
    }
  }

  render() {
    const {
      placeholder,
      name,
      hasErrors,
    } = this.props;
    const { currentValue } = this.state;
    return (
      <div className="input-component-container">
        <div>
          <input
            style={hasErrors ? { border: '1px solid var(--danger)' } : {}}
            name={name}
            className="grey-border"
            placeholder={placeholder}
            onChange={this.onChange}
            onBlur={this.onBlur}
            value={currentValue}
          />
        </div>
      </div>
    );
  }
}

Input.propTypes = {
  value: string,
  placeholder: string,
  name: string,
  callback: func,
  onBlurCallback: func,
};

Input.defaultProps = {
  value: '',
  placeholder: '',
  name: '',
  callback: () => {},
  onBlurCallback: () => {},
};

export default Input;
