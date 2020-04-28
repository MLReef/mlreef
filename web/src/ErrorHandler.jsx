import React, { Component } from 'react';
import ErrorPage from "./components/error-page/errorPage";

class ErrorHandler extends Component {
  constructor(props){
    super(props);
    this.state = {
      hasError: false,
    }
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  render(){
    const { hasError } = this.state;
    if(hasError){
      return <ErrorPage errorCode={500} errorMessage={"Internal error"}/>
    }
    
    return this.props.children;
  }
}


export default ErrorHandler;