import React, { Component } from 'react';
import './input.css';

class Input extends Component {
  constructor(props) {
    super(props);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  handleKeyUp(e) {
    if(e.currentTarget.value) {
      e.currentTarget.classList.remove('grey-border');
      e.currentTarget.classList.add('blue-border-dark-blue-letter');
    }else{
      e.currentTarget.classList.remove('blue-border-dark-blue-letter');
      e.currentTarget.classList.add('grey-border');
    }

    if(this.props.callback && typeof this.props.callback === 'function') {
      this.props.callback(e);
    }
  }

  render() {
    const { placeholder } = this.props;
    const { name } = this.props;
    const { id } = this.props;
    return (
      <div id={`input-${id}-div-container`} className="input-component-container">
        <div>
          <input name={name} id={id} className="grey-border" placeholder={placeholder} onKeyUp={this.handleKeyUp}/>
        </div>
      </div>
    )
  }
}

export default Input;
