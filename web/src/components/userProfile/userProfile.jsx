import React from 'react';
import Navbar from '../navbar/navbar';
import './userProfile.scss';

const UserProfile = () => {
  const avatarImage = 'https://assets.gitlab-static.net/uploads/-/system/user/avatar/3839940/avatar.png';
  return (
    <>
      <Navbar />
      <div className="layout-page">
        <div className="content-wrapper">
          <div className="user-profile">
            <img src={avatarImage} alt="avatar" />
            <p>Username</p>
            <p>status description</p>
            <p>@mlreef | Member since January 2019</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
