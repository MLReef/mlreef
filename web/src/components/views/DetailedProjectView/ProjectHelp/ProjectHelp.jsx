import React, { useMemo } from 'react';
import { bindActionCreators } from 'redux';
import { connect, useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { updateUserClosedInstructions } from 'store/actions/userActions';
import { PROJECT_TYPES } from 'domain/project/projectTypes';
import CodeProjectContent from './CodeProjectContent';
import MLProjectContent from './MLProjectContent';
import { fireModal } from 'store/actions/actionModalActions';
import './ProjectHelp.scss';
import { useHistory } from 'router';

const docUrl = 'https://docs.mlreef.com/0-general/1-repositories/1-ml_projects.md';

export const ProjectHelp = (props) => {
  const {
    id,
    closedInstructions,
    actions,
    isEmptyRepo,
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


  const selectedProject = useSelector((state) => state.projects.selectedProject);

  const location = useLocation();

  const history = useHistory();

  const isShown = useMemo(() => !closedInstructions[id] || false, [id, closedInstructions]);

  const handleClose = () => {
    actions.updateUserClosedInstructions({ [id]: true });
  };

  if (isShown) {
    return (
    <div className="project-help">
      <div className="project-help-container">
        <button
          type="button"
          onClick={handleClose}
          className="project-help-close btn btn-hidden t-info m-2"
        >
          Hide this help
        </button>
        {id === PROJECT_TYPES.CODE && (
          <CodeProjectContent projectUrl={location.pathname} />
        )}
        {id === PROJECT_TYPES.DATA && (
          <MLProjectContent projectUrl={location.pathname} />
        )}
      </div>
    </div>
    )
  }
  
  if (isEmptyRepo) {
    return (
    <div className="project-help-hidden-helpers">
      <h4>Quick options to get started:</h4>
      <div className="project-help-hidden-helpers-links">
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
        disabled={id === PROJECT_TYPES.DATA}
        onClick={openVideo}
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
      <hr />
      <div className="project-help-hidden-helpers-actions">
        <button title="normal" className="btn btn-primary" onClick={() => {
          history.push(`/${selectedProject.namespace}/${selectedProject.slug}/master/upload-file`);
        }}>
          Upload files
        </button>
        <button title="normal" className="btn btn-primary"  onClick={() => {
          history.push(`/${selectedProject.namespace}/${selectedProject.slug}/-/tree/file/editor/new`);
        }}>
          Create a new file
        </button>
      </div>
    </div>
    )
  }

  return null;
};

ProjectHelp.propTypes = {
  id: PropTypes.string.isRequired,
  closedInstructions: PropTypes.shape({}).isRequired,
  actions: PropTypes.shape({
    updateUserClosedInstructions: PropTypes.func.isRequired,
  }).isRequired,
};

const mapStateToProps = (state) => ({
  closedInstructions: state.user.meta.closedInstructions,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({ updateUserClosedInstructions }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectHelp);
