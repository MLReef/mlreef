import React from 'react';

export const registerModal = {
  type: 'success',
  title: 'You need to sign in to proceed',
  content: (
    <div className="m-auto t-center mt-4">
      <img
        style={{ height: '160px' }}
        alt="register"
        src="/images/MLReef_lock_opt.gif"
      />
      <h3>You are not logged in.</h3>
      <p>
        This area is restricted to MLReef users only. Please register or sign in
        to your account.
      </p>
    </div>
  ),
  ignoreLabel: 'Return',
  negativeLabel: 'Register',
  positiveLabel: 'Sign In',
};

// popup's content when ask upgrade account. This is temporary and will be changed
// to a promotional image
export const upgradeAccountModal = {
  type: 'info',
  title: 'Upgraded needed',
  content: (
    <div className="m-auto t-center">
      <h3>Please upgrade your account!</h3>
    </div>
  ),
  positiveLabel: 'UPGRADE',
  negativeLabel: 'BACK',
};

// popup's content when suggest to fork.
export const forkProjectModal = {
  type: 'info',
  title: 'You need permissions to access this feature',
  content: (
    <div className="m-auto t-center">
      <h3>You can fork this project!</h3>
    </div>
  ),
  positiveLabel: 'FORK!',
  negativeLabel: 'BACK',
};
