import React from 'react';
import PropTypes from 'prop-types';
import gitlabIcon from 'images/gitlab-icon.png';
import githubIcon from 'images/github-icon.png';
import googleIcon from 'images/google-icon.png';
import linkedinIcon from 'images/linkedin-icon.png';
import './OAuth.scss';

export const OAuth = (props) => {
  const { fromLogin } = props;
  return (
    <div className="oauth-view_links">
      <div className="oauth-view_links_header">
        <div className="oauth-view_links_header_border" />
        <label className="oauth-view_links_header_label">or</label>
      </div>

      <div className="oauth-view_links_body">
        <label>{fromLogin ? "Login using:" : "Create an account using:"}</label>

        <div className="links">
          <a className="link gitlab" href="/api/v1/social/authorize/gitlab">
            <img src={gitlabIcon} alt=""/>
            <label>Gitlab</label>
          </a>
          <a className="link github" href="/api/v1/social/authorize/github">
            <img src={githubIcon} alt=""/>
            <label>GitHub</label>
          </a>
          <a className="link google" href="/api/v1/social/authorize/google">
            <img src={googleIcon} alt=""/>
            <label>Google</label>
          </a>
          <a className="link linkedin" href="/api/v1/social/authorize/linkedin">
            <img src={linkedinIcon} alt=""/>
            <label>Linkedin</label>
          </a>
        </div>
      </div>
    </div>
  )
}

OAuth.propTypes = {
  fromLogin: PropTypes.bool
}