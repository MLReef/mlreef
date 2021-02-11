import React, { useState, useMemo } from 'react';
import { connect } from 'react-redux';
import { Link } from 'router';
import PropTypes from 'prop-types';
import MSelect from 'components/ui/MSelect';
import { tutorials } from 'components/commons/Tutorial/data.json';
import './RegisterView.scss';

const RegisterLandingView = (props) => {
  const { user: { userInfo: { name } } } = props;

  const [tutorialId, setTutorialId] = useState(tutorials[0]?.id);

  const options = tutorials.filter((t) => t.visibility !== 'hidden')
    .map((t) => ({ label: t.name, value: t.id }));

  const tutorial = useMemo(
    () => tutorials.find((t) => t.id === tutorialId),
    [tutorialId],
  );

  const tutorialRedirect = useMemo(
    () => `${(tutorial?.redirect || '/')}?tutorial=1&id=${tutorial?.id}`,
    [tutorial],
  );

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
        <div className="register-landing-view-tutorial border-rounded">
          <div className="register-landing-view-tutorial-content">
            <h4>Start with a tutorial</h4>
            <p>Learn MLReef by our curated hands-on video tutorials</p>
            <MSelect
              value={tutorialId}
              label="Select a tutorial"
              options={options}
              onSelect={setTutorialId}
              variant="dark"
            />
            <Link
              to={tutorialRedirect}
              disabled={!tutorialId}
              className="btn btn-info btn-prepend my-3"
            >
              <span
                className="btn-prepend-icon"
                style={{ backgroundImage: 'url(/images/Tutorials-01.png)' }}
              />
              Start tutorial
            </Link>
          </div>
          {tutorial?.image && (
            <div
              className="register-landing-view-tutorial-image border-rounded"
              style={{ backgroundImage: `url(${tutorial.image})` }}
            />
          )}
        </div>
        <div className="user-options">
          <Link className="option-link mb-3 info-box" to="/new-project/classification/ml-project">
            <div className="option-icon" style={{ backgroundColor: 'var(--dark)' }} />
            <div className="state-body pl-3">
              <h4 className="state-title mt-0">Create a Project</h4>
              <p className="state-text mt-0">
                In MLReef there are ML projects, which host your data and experiments.
                Furthermore you can create code only projects for data operations, data
                visualizations and ML models.
              </p>
            </div>
          </Link>
          <Link className="option-link mb-3 success-box" to="/groups/new">
            <div className="option-icon" style={{ backgroundColor: 'var(--success)' }} />
            <div className="state-body">
              <h4 className="state-title mt-0">Create a Group</h4>
              <p className="state-text">
                In a group you can manage shared projects and coordinate with your group members.
              </p>
            </div>
          </Link>
          <Link className="option-link mb-3 danger-box" to="/#explore">
            <div className="option-icon" style={{ backgroundColor: 'var(--danger)' }} />
            <div className="state-body">
              <h4 className="state-title mt-0">Explore Public Projects</h4>
              <p className="state-text">
                Public projects are an easy way to get started. Explore the ever
                growing number of projects, get inspired and be part of the reef
              </p>
            </div>
          </Link>
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
