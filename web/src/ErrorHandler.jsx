import React, { Component } from 'react';
import ErrorPage from './components/error-page/errorPage';

class ErrorHandler extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  componentDidCatch(error, info) {    
    this.setState({ hasError: true });
    console.log(error);
    console.log(info);
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
