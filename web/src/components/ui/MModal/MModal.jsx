import React from 'react';
import { createPortal } from 'react-dom';

const modalRoot = document.getElementById('modal-root');

class MModal extends React.Component {
  constructor(props) {
    super(props);
    this.el = document.createElement('div'); // createElement has to be invoked to have an element of the DOM.
  }

  componentDidMount() {
    modalRoot.appendChild(this.el);
  }

  componentWillUnmount() {
    modalRoot.removeChild(this.el);
  }

  render() {
    const {
      children,
    } = this.props;
    return createPortal(
      children,
      this.el,
    );
  }
}

export default MModal;
