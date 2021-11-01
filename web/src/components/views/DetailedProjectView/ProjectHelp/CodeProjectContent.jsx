import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'router';
import { fireModal } from 'store/actions/actionModalActions';
import './ProjectHelp.scss';

const docUrl = 'https://docs.mlreef.com/4-code-projects/1-publishing_code_repository.md';

export const CodeProjectContent = (props) => {
  const {
    projectUrl,
  } = props;

  const dispatch = useDispatch();

  const openVideo = () => {
    dispatch(fireModal({
      type: 'info',
      title: '',
      noActions: true,
      content: (
        <div className="p-1">
          <iframe
            width="562"
            height="315"
            src="https://www.youtube.com/embed/TdYmbck6m3Y"
            title="Creating AI Modules tutorial"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ),
    }));
  };

  return (
    <>
      <div className="project-help-content">
        <div className="project-help-content-block">
          <h3 className="project-help-content-block-title">How to create your own AI modules?</h3>
          <p>
            AI Modules are are git repositories that host a specific function within the
            ML life cycle (e.g. a new algorithm) that can be accessed
            in <strong>MLReef pipelines</strong>.
          </p>
          <p>
            In order to create your custom module, you need to do the following steps:
          </p>
          <ol className="project-help-list">
            <li className="project-help-list-item">
              The repository should at least contain one <strong>python file</strong> (.py) with:
              <ul>
                <li>
                  CLI arguments (e.g. argv) for at least data input-path and output-path.
                </li>
                <li>
                  CLI arguments (e.g. argv) for at least data input-path and output-path.
                </li>
              </ul>
            </li>
            <li className="project-help-list-item">
              Place a <strong>requirements.txt</strong> file with your pip dependencies
              (e.g. tensorflow==2.6.0)
            </li>
            <li className="project-help-list-item">
              Publish your repository to use it in the corresponding pipelines in ML Projects.
            </li>
          </ol>
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
              onClick={openVideo}
            >
              Watch a video tutorial
            </button>
            <a
              href="/mlreef/example-ai-module"
              className="btn btn-outline-info m-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              See example repo
            </a>
          </div>
        </div>
        <div className="project-help-content-image">
          <img src="/images/code_project.png" alt="help cards" />
        </div>
      </div>
      <div className="project-help-actions">
        <h4>Possible next steps:</h4>
        <p>
          You can also just jump ahead. Use git to push existing code into this repository or:
        </p>
        <div>
          <button
            type="button"
            className="btn btn-primary m-2"
            disabled
            title="Not available yet"
          >
            Import a repository
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

CodeProjectContent.propTypes = {
  projectUrl: PropTypes.string.isRequired,
};

export default CodeProjectContent;
