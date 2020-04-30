/* eslint-disable no-nested-ternary */
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import './projectNav.css';
import {
  string, shape, arrayOf, number,
} from 'prop-types';

const ProjectNav = (props) => {
  const { selectedProject: { name }, folders, projectId } = props;

  return (
    <div className="project-nav">
      {folders.map((folder, index) => (folder === name)
        ? (
          <Link
            key={`project-nav-link-${index.toString()}`}
            to={`/my-projects/${projectId}/master`}
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
  projectId: number.isRequired,
};

function mapStateToProps(state) {
  return {
    selectedProject: state.projects.selectedProject,
  };
}

export default connect(mapStateToProps)(ProjectNav);
