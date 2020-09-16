import React, { Component } from 'react';
import ErrorPage from './components/error-page/errorPage';

class ErrorHandler extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  componentDidCatch() {
    this.setState({ hasError: true });
  }

  render() {
    const { hasError } = this.state;
    const { children } = this.props;
    if (hasError) {
      return <ErrorPage errorCode={500} errorMessage="Internal error" />;
    }

    return children;
  }
}


export default ErrorHandler;
