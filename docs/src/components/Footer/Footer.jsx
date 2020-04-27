import React, { Component } from "react";
// import { Link } from "gatsby";
import "./Footer.css";

class Footer extends Component {
  render() {
    const { config } = this.props;
    // const url = config.siteRss;
    const { copyright } = config;
    if (!copyright) {
      return null;
    }
    return (
      <footer className="footer">
        <div className="notice-container mx-auto">
          <h4 className="mx-auto py-3">{copyright}</h4>
        </div>
      </footer>
    );
  }
}

export default Footer;
