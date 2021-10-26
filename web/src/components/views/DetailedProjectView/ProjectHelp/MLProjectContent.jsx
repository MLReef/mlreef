import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'router';
import './ProjectHelp.scss';

const docUrl = 'https://docs.mlreef.com/0-general/1-repositories/1-ml_projects.md';

export const MLProjectContent = (props) => {
  const {
    projectUrl,
  } = props;

  return (
    <>
      <div className="project-help-content columns">
        <div className="project-help-content-block">
          <h3 className="project-help-content-block-title">How to get started with your own ML Project?</h3>
          <p>
            ML Projects are <strong>git (LFS)</strong> repositories that contains or is
            connected to your data. From here, you can use the pipelines for data
            pre-processing, visualizing your data or running experiments.
          </p>
          <p>
            In order to create your custom module, you need to do the following steps:
          </p>
        </div>
        <div className="project-help-content-image">
          <img src="/images/ml_project.png" alt="help cards" />
        </div>
        <div className="project-help-content-block">
          <p>
            Once you have data in your ML Project, you can start using the pipelines and to train
            your models.
          </p>
          <p>
            Remember: To use your own scripts in the pipelines, create <strong>AI Modules</strong>.
            These are separate from ML Project and will be available to you, your team or the
            entire community after you publish them.
          </p>
          <div className="project-help-content-block-buttons">
            <a
              href={docUrl}
              className="btn btn-outline-info m-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              View the docs
            </a>
            <button
              type="button"
              className="btn btn-info m-2"
              disabled
            >
              Watch a video tutorial
            </button>
            <a
              href="/mlreef_1/basic-tutorials"
              className="btn btn-outline-info m-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              See example repo
            </a>
          </div>
        </div>
      </div>
      <div className="project-help-actions">
        <h4>Next steps:</h4>
        <p>
          You can also just jump ahead and use git (LFS) to upload data. Alternatively,
          you can use the following options:
        </p>
        <div>
          <button
            type="button"
            className="btn btn-primary m-2"
            disabled
            title="Not available yet"
          >
            Connect external storage
          </button>
          <Link
            to={`${projectUrl}/master/upload-file/path`}
            className="btn btn-primary m-2"
          >
            Upload files
          </Link>
          <Link
            to={`${projectUrl}/-/tree/branch/master/file/editor/new`}
            className="btn btn-primary m-2"
          >
            Create a new file
          </Link>
        </div>
      </div>
    </>
  );
};

MLProjectContent.propTypes = {
  projectUrl: PropTypes.string.isRequired,
};

export default MLProjectContent;
