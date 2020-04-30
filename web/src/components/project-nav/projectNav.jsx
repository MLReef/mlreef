import React from 'react';
import { Link } from 'react-router-dom';
import './projectNav.css';

const ProjectNav = (params) => (
  <div className="project-nav">
    {params.folders.map((folder, index) => ((index === (params.folders.length - 1))
      ? folder === 'Data'
        ? (
          <Link key={`project-nav-link-${index}`} to={`/my-projects/${params.projectId}/master`}>
            {' '}
            <p>
              {' '}
              {folder}
              {' '}
&nbsp;
            </p>
          </Link>
        )
        : (
          <p key={`project-nav-paragraph-${index}`}>
            {folder}
&nbsp;
          </p>
        )
      : folder === 'Data'
        ? (
          <Link key={`project-nav-link-${index}`} to={`/my-projects/${params.projectId}/master`}>
            {' '}
            <p>
              {' '}
              {folder}
              {' '}
&nbsp;> &nbsp;
            </p>
          </Link>
        )
        : (
          <p key={`project-nav-paragraph-${index}`}>
            {' '}
            {folder}
&nbsp;>&nbsp;
          </p>
        )))}
  </div>
);

export default ProjectNav;
