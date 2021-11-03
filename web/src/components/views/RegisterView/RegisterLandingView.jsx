import React, { useState, useMemo } from 'react';
import { connect } from 'react-redux';
import { Link } from 'router';
import PropTypes from 'prop-types';
import TagManager from 'react-gtm-module';
import MSelect from 'components/ui/MSelect';
import { tutorials } from 'components/commons/Tutorial/data.json';
import './RegisterView.scss';
import Navbar from 'components/navbar/navbar';

const RegisterLandingView = (props) => {
  const { user: { userInfo: { name, id } } } = props;

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
      <Navbar />
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
            <p>Learn how to use MLReef with hands-on tutorials!</p>
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
        <div
          className="user-options"
          onClick={(e) => {
            const date = new Date();
            const tagManagerArgs = {
              gtmId: 'GTM-K8HPDBL',
              events: {
                view: 'WelcomePage',
                userId: id,
                ref: e.target.id,
                timestamp: date.toString()
              },
            };
            TagManager.initialize(tagManagerArgs);
          }}
        >
          <Link className="option-link mb-3 danger-box" to="/dashboard/public/data_project">
            <div id="explore-link-icon" className="option-icon" style={{ backgroundColor: 'var(--danger)' }} />
            <div id="explore-link-content" className="state-body">
              <h4 id="explore-link-title" className="state-title mt-0">Explore Public Projects</h4>
              <p id="explore-link-text-content" className="state-text">
                Public projects are an easy way to get started. Explore the ever
                growing number of ML Projects, get inspired and be part of the reef.
              </p>
            </div>
          </Link>
          <Link className="option-link mb-3 info-box" to="/new-project/classification/ml-project">
            <div id="new-project-link-icon" className="option-icon" style={{ backgroundColor: 'var(--dark)' }} />
            <div id="new-project-link-content" className="state-body pl-3">
              <h4 id="new-project-link-title" className="state-title mt-0">Create a ML Project</h4>
              <p id="new-project-link-text-content" className="state-text mt-0">
                In MLReef there are ML projects, which host your data, all pipelines and experiments.
                Separate to them, you can create AI Modules in the AI Library. These host your ML
                functions, for example for data operations, data visualizations or models.
              </p>
            </div>
          </Link>
          <Link className="option-link mb-3 success-box" to="/groups/new">
            <div id="new-group-link-icon" className="option-icon" style={{ backgroundColor: 'var(--success)' }} />
            <div id="new-group-link-content" className="state-body">
              <h4 id="new-group-link-title" className="state-title mt-0">Create a Group</h4>
              <p id="new-group-link-text-content" className="state-text">
                In a group you can manage shared projects and coordinate with your group members.
              </p>
            </div>
          </Link>
          <a className="option-link mb-3 warning-box" href="https://doc.mlreef.com/" target="_blank" rel="noopener noreferrer">
            <div id="documentation-link-icon" className="option-icon" style={{ backgroundColor: 'var(--warning)' }} />
            <div id="documentation-link-content" className="state-body">
              <h4 id="documentation-link-title" className="state-title mt-0">Learn more about MLReef</h4>
              <p id="documentation-link-text-content" className="state-text">
                Take a look at the documentation to learn about all capabilities of MLReef.
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
