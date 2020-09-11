import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import MButton from 'components/ui/MButton';
import PropTypes from 'prop-types';
import Base64ToArrayBuffer from 'base64-arraybuffer';
import UserApi from 'apis/UserApi';
import { INFORMATION_UNITS } from 'domain/informationUnits';
import './Profile.scss';

const userApi = new UserApi();

const ProfileSection = (props) => {
  const { user: { auth, username, gitlab_id: gitlabId, userInfo: { avatar_url: avatarUrl } } } = props;
  const fileMaxSize = 200;
  const imageInput = useRef();
  const [imgBase, setImgBase] = useState(avatarUrl);
  const [avatarFile, setAvatarFile] = useState(null);
  const [file, setImageName] = useState('No file chosen');
  const [userName, setUserName] = useState(username);
  const [status, setUserStatus] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    userApi.getUserStatus(gitlabId)
      .then((res) => res.message !== null ? setUserStatus(res.message) : setUserStatus(''))
      .catch(() => toastr.error('Error', 'Could not fetch the status'));
  }, [gitlabId]);

  const profileStatusUpdate = () => userApi.updateUserStatus(status)
    .then(() => {
      setUploading(false);
      toastr.success('Success', 'Status has been updated successfully');
    })
    .catch(() => toastr.error('Error', 'Status cannot be updated'));

  const updateProfileSettings = (e) => {
    setUploading(true);
    e.preventDefault();
    const payload = {
      admin: auth,
      gitlabId,
      name: userName,
    };
    if (avatarFile && typeof avatarFile !== 'undefined') {
      const reader = avatarFile.stream().getReader();
      reader.read().then((content) => {
        payload.avatar = Base64ToArrayBuffer.encode(content.value);
        profileStatusUpdate(payload);
      });
    } else {
      profileStatusUpdate(payload);
    }
  };

  const handleImageSelect = (event) => {
    const selectedFiles = event.target.files[0];
    if (selectedFiles !== undefined) {
      if ((selectedFiles.size / INFORMATION_UNITS.KILOBYTE) > fileMaxSize) {
        toastr.error('Error', 'File size exceeds 200Kb');
      } else {
        setAvatarFile(selectedFiles);
        setImageName(selectedFiles.name);
        const reader = new FileReader();
        reader.addEventListener('load', () => {
          setImgBase(reader.result);
        }, false);
        reader.readAsDataURL(selectedFiles);
      }
    }
  };

  return (
    <div className="user-form">
      <div className="row d-flex">
        <div className="pl-4 pr-4 left-row">
          <h4 className="mt-0 display-1">Public Avatar</h4>
          <p>
            You can change your avatar here or remove the
            current avatar to revert to
            <a href="https://gravatar.com" target="_blank" rel="noopener noreferrer"> gravatar.com</a>
          </p>
        </div>
        <div className="pl-4 right-row">
          <div className="mb-0" style={{ float: 'left' }}>
            <a target="_blank" href={avatarUrl} rel="noopener noreferrer">
              <img style={{ borderRadius: '50%' }} className="mr-3 avatar resposniveAvatar" width="140" height="140" src={imgBase} alt="" />
            </a>
          </div>
          <h5 className="mt-0">Upload new avatar</h5>
          <div className="mt-1 mb-2">
            <button
              type="button"
              className="btn btn-basic-dark"
              onClickHandler={() => imageInput.current.click()}
            >
              Choose File
            </button>
            <span className="ml-2" style={{ position: 'relative', display: 'inline-block' }}>{file}</span>
            <input
              ref={imageInput}
              id="image-file"
              className="d-none invisible"
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
            />
          </div>
          <div className="mb-0 mt-3 t-secondary">The maximum file size allowed is 200Kb</div>
        </div>
      </div>
      <hr />
      <div className="row d-flex mt-4">
        <div className="pl-4 pr-4 left-row">
          <h4 className="mt-0">Current Status</h4>
          <p>
            This emoji and message will appear on you profile
            and throughout the interface.
          </p>
        </div>
        <div className="pl-4 pr-4 right-row">
          <label htmlFor="user_status"><h5 className="m-0">Your Status</h5></label>
          <input
            className="mt-3 w-auto"
            id="user_status"
            type="text"
            value={status === null ? '' : status}
            placeholder="What's your status?"
            onChange={(e) => setUserStatus(e.target.value)}
          />
        </div>
      </div>
      <hr />
      <div className="row d-flex">
        <div className="pl-4 pr-4 mt-4 left-row">
          <h4 className="mt-0">Main Settings</h4>
          <p>
            This information will appear on your
            profile.
          </p>
        </div>
        <div className="pr-4 d-flex right-row">
          <div className="pr-4 pl-4 mb-4 left-col">
            <label htmlFor="user_name"><h5>Full name</h5></label>
            <input
              className="mt-1 w-100"
              id="user_name"
              type="text"
              placeholder="Current name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <p hidden>Please enter your name</p>
            <p className="mt-2" style={{ color: '#919191' }}>Enter your name, so people you know can recognize you.</p>
          </div>
          <div className="pr-4 pl-4 mb-4 right-col">
            <label htmlFor="user_id"><h5>User ID</h5></label>
            <input
              readOnly
              className="mt-1 w-50 muted bg-light"
              id="user_id"
              type="text"
              value={gitlabId}
            />
          </div>
        </div>
      </div>
      <div className="pl-4 mt-4">
        <MButton
          type="button"
          waiting={uploading}
          className="btn btn-primary"
          onClick={(e) => updateProfileSettings(e)}
        >
          Update Profile Settings
        </MButton>
      </div>
    </div>
  );
};

ProfileSection.propTypes = {
  user: PropTypes.shape({
    auth: PropTypes.bool.isRequired,
    username: PropTypes.string.isRequired,
    gitlab_id: PropTypes.number.isRequired,
    userInfo: PropTypes.shape({
      avatar_url: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    user: state.user,
  };
}

export default connect(mapStateToProps)(ProfileSection);
