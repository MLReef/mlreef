import React, { useRef } from 'react';
import { string } from 'prop-types';
import { Link } from 'react-router-dom';
import './CommitDiv.scss';
import MEmptyAvatar from 'components/ui/MEmptyAvatar';
import { getTimeCreatedAgo } from 'functions/dataParserHelpers';

const CommitDiv = (props) => {
  const {
    branch,
    time,
    id,
    name,
    title,
    commitid,
    avatarImage,
    userName,
    namespace,
    slug,
  } = props;
  const spanRef = useRef();
  const today = new Date();
  const previous = new Date(time);
  const timediff = getTimeCreatedAgo(previous, today);
  const inputRef = useRef();

  function onClick() {
    const phantomInput = document.createElement('input');
    phantomInput.value = spanRef.current.innerText;
    document.body.appendChild(phantomInput);
    phantomInput.select();
    document.execCommand('copy');
    document.body.removeChild(phantomInput);
  }

  return (
    <div className="commit-div">
      {avatarImage
        ? (
          <Link to={`/${userName}`}>
            <span style={{ position: 'relative' }}>
              <img width="32" height="32" className="avatar-circle mt-3 ml-1" src={avatarImage} alt="avatar" />
            </span>
          </Link>
        ) : <MEmptyAvatar styleClass="avatar-sm" projectName={userName} />}
      <div className="commit-div-data">
        <Link to={`/${namespace}/${slug}/-/commits/${branch}/-/${commitid}`}>{title}</Link>
        <span>
          {userName
            ? (
              <a href={`/${userName}`}>
                {name}
              </a>
            ) : (
              <p>{name}</p>
            )}
          {' '}
          authored
          {' '}
          {timediff}
        </span>
      </div>
      <div className="commit-div-details">
        <input type="text" ref={inputRef} style={{ display: 'none' }} />
        <span ref={spanRef} className="border-rounded-left" title={id}>{id}</span>
        <button
          title={id}
          type="button"
          label="clone"
          className="btn btn-icon fa fa-copy t-primary"
          onClick={onClick}
        />
      </div>
    </div>
  );
};

CommitDiv.propTypes = {
  branch: string.isRequired,
  time: string.isRequired,
  id: string.isRequired,
  name: string.isRequired,
  title: string.isRequired,
  commitid: string.isRequired,
  namespace: string.isRequired,
  slug: string.isRequired,
  avatarImage: string.isRequired,
  userName: string.isRequired,
};

export default CommitDiv;
