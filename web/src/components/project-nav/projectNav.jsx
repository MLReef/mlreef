import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import './projectNav.css';
import {
  string, shape, arrayOf,
} from 'prop-types';

const ProjectNav = (props) => {
  const { selectedProject } = props;
  if (!selectedProject) {
    return (
      <></>
    );
  }
  const { folders } = props;
  const { name, id } = selectedProject;

  return (
    <div className="project-nav">
      {folders.map((folder, index) => (folder === name)
        ? (
          <Link
            key={`project-nav-link-${index.toString()}`}
            to={`/my-projects/${id}/master`}
          >
            <p className="px-1">
              {` ${folder} > `}
            </p>
          </Link>
        )
        : (
          <p className="px-1" key={`project-nav-paragraph-${index.toString()}`}>
            {index === (folders.length - 1) ? ` ${folder} ` : ` ${folder} > ` }
          </p>
        ))}
    </div>
  );
};

ProjectNav.propTypes = {
  selectedProject: shape({
    name: string.isRequired,
  }).isRequired,
  folders: arrayOf(string).isRequired,
};

function mapStateToProps(state) {
  return {
    selectedProject: state.projects.selectedProject,
  };
}

export default connect(mapStateToProps)(ProjectNav);
