import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import './RegisterView.scss';

const RegisterLandingView = (props) => {
  const { user: { userInfo: { name } } } = props;
  return (
    <div className="landing-container">
      <div className="first-state">
        <h2 className="title-lg">
          Welcome to MLReef
          <br />
          {`@${name}`}
        </h2>
      </div>
      <div className="second-state">
        <div className="user-options">
          <a className="option-link mb-3 info-box" href="/new-project/classification/ml-project">
            <div className="option-icon" style={{ backgroundColor: 'var(--info)' }} />
            <div className="state-body pl-3">
              <h4 className="state-title mt-0">Create a Project</h4>
              <p className="state-text mt-0">
                In MLReef there are ML projects, which host your data and experiments.
                Furthermore you can create code only projects for data operations, data
                visualizations and ML models.
              </p>
            </div>
          </a>
          <a className="option-link mb-3 success-box" href="/groups/new">
            <div className="option-icon" style={{ backgroundColor: 'var(--success)' }} />
            <div className="state-body">
              <h4 className="state-title mt-0">Create a Group</h4>
              <p className="state-text">
                In a group you can manage shared projects and coordinate with your group members.
              </p>
            </div>
          </a>
          <a className="option-link mb-3 danger-box" href="/#explore">
            <div className="option-icon" style={{ backgroundColor: 'var(--danger)' }} />
            <div className="state-body">
              <h4 className="state-title mt-0">Explore Public Projects</h4>
              <p className="state-text">
                Public projects are an easy way to get started. Explore the ever
                growing number of projects, get inspired and be part of the reef
              </p>
            </div>
          </a>
          <a className="option-link mb-3 warning-box" href="https://doc.mlreef.com/" target="_blank" rel="noopener noreferrer">
            <div className="option-icon" style={{ backgroundColor: 'var(--warning)' }} />
            <div className="state-body">
              <h4 className="state-title mt-0">Learn more about MLReef</h4>
              <p className="state-text">
                Take a look at the documentation to know about
                all capabilities of MLReef
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

RegisterLandingView.propTypes = {
  user: PropTypes.shape({
    userInfo: PropTypes.shape({
      name: PropTypes.string,
    }),
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    user: state.user,
  };
}

export default connect(mapStateToProps)(RegisterLandingView);
