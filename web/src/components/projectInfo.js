import React from "react";
import star_01 from "./../images/star_01.svg";
import fork_01 from "./../images/fork_01.svg";
import clone_01 from "./../images/clone_01.svg";
import arrow_01 from "./../images/arrow_down_blue-01.png";
const ProjectInfo = ({ info }) => {
  let iconUrl = "";
  if (info.namespace) {
    iconUrl = info.namespace.avatar_url;
  }
  return (
    <div className="project-info">
      <div className="project-id">
        <div className="project-pic">
          <img src={iconUrl} alt="" />
        </div>
        <div className="project-name">
          <p id="projectName">{info.name}</p>
          <p id="projectId">Project ID: {info.id}</p>
        </div>
      </div>

      <div className="project-options">
        <div className="options">
          <button className="option-name">
            <img id="option-image" src={star_01} alt="" />
            <p>Star</p>
          </button>

          <div className="counter">
            <p>{info.star_count}</p>
          </div>
        </div>

        <div className="options">
          <button className="option-name">
            <img id="option-image" src={fork_01} alt="" />
            <p>Fork</p>
          </button>

          <div className="counter">
            <p>{info.forks_count}</p>
          </div>
        </div>
        <div className="options">
          <button className="option-name">
            <img id="option-image" src={clone_01} alt="" />
            <p>Clone</p>
          </button>

          <div className="counter">
            <img className="dropdown-white" src={arrow_01} alt="Clone" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfo;
