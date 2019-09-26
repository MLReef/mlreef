import React from "react";
import { connect } from 'react-redux';
import { Link } from "react-router-dom";
import { Redirect } from 'react-router-dom'
import star_01 from "./../images/star_01.svg";
import fork_01 from "./../images/fork_01.svg";
import clone_01 from "./../images/clone_01.svg";
import projectGeneralInfoApi from "./../apis/projectGeneralInfoApi";
import arrow_01 from "./../images/arrow_down_blue-01.png";

const ProjectInfo = ({ info }) => {
  let iconUrl = info.avatar_url;
  const [redirect, setRedirect] = React.useState(false);

  function handleFork() {
    projectGeneralInfoApi.forkProject("gitlab.com", info.id, info.name)
      .then(res => res.json())
      .then(result => console.log(result));
    setRedirect(true);
  }

  return (
    <div className="project-info">
      <div className="project-id">
        <Link to={`/my-projects/${info.id}/${info.default_branch}`}>
          <div className="project-pic">
            <img style={{ minWidth: "100%" }} src={iconUrl} alt="" />
          </div>
        </Link>
        <div className="project-name">
          <Link to={`/my-projects/${info.id}/${info.default_branch}`} id="projectName">{info.name}</Link>
          <p id="projectId">Project ID: {info.id} | 526MB used</p>
        </div>
      </div>
      {redirect ? <Redirect to='/my-projects' /> : null}
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
          <button className="option-name" onClick={handleFork}>
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
          <Clonedropdown http={info.http_url_to_repo} ssh={info.ssh_url_to_repo} />
        </div>
      </div>
    </div>
  );
};

function Clonedropdown(props) {
  //The following code can be used to refactor the rest of the code. New way of writing the code.
  const node = React.useRef();
  const [open, setOpen] = React.useState(false);

  const handleClickOutside = e => {
    if (node.current.contains(e.target)) {
      // inside click
      return;
    }
    // outside click
    setOpen(false);
  };

  React.useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <>
      <div className="counter clone-dropdown" ref={node} onClick={e => setOpen(!open)}>
        <img className="dropdown-white" src={arrow_01} alt="Clone" />
        {open && (
          <div className="clone-box">
            <div className="link-box">
              <p>Clone with SSH</p>
              <div className="clone-link">
                <input type="text" value={props.ssh} className="ssh-http-link" readOnly />
                <img className="clone-icon" src={clone_01} alt="" />
              </div>
            </div>
            <div className="link-box">
              <p>Clone with HTTPS</p>
              <div className="clone-link">
                <input type="text" value={props.http} className="ssh-http-link" readOnly />
                <img className="clone-icon" src={clone_01} alt="" />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function mapStateToProps(state) {
  return {
    files: state.files,
    project: state.project,
    file: state.file
  };
}

export default connect(mapStateToProps)(ProjectInfo);
