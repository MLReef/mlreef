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
      id,
    } = this.props;
    const { currentValue } = this.state;
    return (
      <div id={`input-${id}-div-container`} className="input-component-container">
        <div>
          <input
            name={name}
            id={id}
            className="grey-border"
            placeholder={placeholder}
            onChange={this.onChange}
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
  id: string,
  callback: func,
};

Input.defaultProps = {
  value: '',
  placeholder: '',
  name: '',
  id: '',
  callback: () => {},
};

export default Input;
