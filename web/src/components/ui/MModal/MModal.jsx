import React from 'react';
import { createPortal } from 'react-dom';

const modalRoot = document.getElementById('modal-root');

class MModal extends React.Component {
  constructor(props) {
    super(props);
    this.el = <div />;
  }

  componentDidMount() {
    modalRoot.appendChild(this.el);
  }

  componentWillUnmount() {
    modalRoot.removeChild(this.el);
  }

  render() {
    return createPortal(
      this.props.children,
      this.el,
    );
  }
}

export default MModal;
