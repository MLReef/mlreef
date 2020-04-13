import React, { useState, useEffect } from 'react';
import projectGeneralInfoApi from 'apis/projectGeneralInfoApi';
import { toastr } from 'react-redux-toastr';
import './MProjectCard.scss';

const MProjectCard = ({
  projectId,
  title,
  description,
  branch,
  starCount,
  forkCount,
  namespace,
  push,
}) => {
  const [avatars, setAvatars] = useState([]);
  const mainDiv = React.useRef(false);
  useEffect(() => {
    projectGeneralInfoApi
      .getProjectContributors(projectId)
      .then(async (res) => {
        if (!res.ok) {
          Promise.reject(res);
        } else {
          const contributors = await res.json();
          if (mainDiv.current) {
            setAvatars(contributors.map((cont) => ({ id: cont.id, url: cont.avatar_url })));
          }
        }
      }).catch(() => toastr.error('Error', 'Something went wrong fetching contributors'));
  }, [projectId]);
  const avatarsLength = avatars.length;
  return (
    <div
      className="card"
      ref={mainDiv}
    >
      <div
        role="button"
        tabIndex="0"
        className="card-container project-card-container"
        onClick={() => push(`/my-projects/${projectId}/${branch}`)}
        onKeyPress={() => push(`/my-projects/${projectId}/${branch}`)}
      >
        <p className="card-title">
          {title}
        </p>
        <br />
        {namespace && (
        <div className="d-flex" style={{ alignItems: 'center' }}>
          <div className="avatar-container" style={{ marginRight: '0.5rem' }}>
            <img src={namespace.avatar_url} alt="" style={{ width: 'inherit' }} />
          </div>
          <p style={{ margin: 0 }}>{namespace.name}</p>
        </div>
        )}
        <div className="card-content">
          <div className="d-flex">
            <div className="mr-2">
              <i className="fa fa-file t-success">
                <span className="label"> Text</span>
              </i>
            </div>
            <div className="mr-2">
              <i className="fa fa-volume-up t-info">
                <span className="label"> Audio</span>
              </i>
            </div>
            <div className="">
              <i className="fa fa-video t-danger">
                <span className="label"> Video</span>
              </i>
            </div>
            <div className="">
              <i class="fas fa-grip-lines-vertical t-warning">
                <span className="label"> Tabular</span>
              </i>
            </div>
          </div>

          <p>
            {description}
          </p>

          <div className="d-flex t-secondary">
            <div className="mr-3">
              <i className="fa fa-star">
                <span className="label">{starCount}</span>
              </i>
            </div>
            <div className="mr-3">
              <i className="fa fa-code-branch">
                <span className="label">{forkCount}</span>
              </i>
            </div>
          </div>

        </div>
        <div className="card-actions">
          <div
            className=""
            style={{
              display: 'flex',
              marginRight: '-1rem',
            }}
          >
            {avatars.map((ava, index) => (
              <div key={`ava-cont-${ava.id}`} className={`avatar-container ${index === avatarsLength && 'grouped'}`}>
                <img src={ava.url} alt="" style={{ width: 'inherit' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MProjectCard;
