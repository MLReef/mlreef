import React, { useMemo } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { updateUserClosedInstructions } from 'store/actions/userActions';
import { PROJECT_TYPES } from 'domain/project/projectTypes';
import CodeProjectContent from './CodeProjectContent';
import MLProjectContent from './MLProjectContent';
import './ProjectHelp.scss';


export const ProjectHelp = (props) => {
  const {
    id,
    closedInstructions,
    actions,
  } = props;

  const location = useLocation();

  const isShown = useMemo(() => !closedInstructions[id] || false, [id, closedInstructions]);

  const handleClose = () => {
    actions.updateUserClosedInstructions({ [id]: true });
  };

  return isShown && (
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
  );
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
