//
// When changing or adding variables here, please make sure to also add them in the the
// `.env` file with appropriate documentation
//

// Set by the CI pipeline
export const APP_BUILD_NUMBER = process.env.REACT_APP_BUILD_NUMBER || 'SNAPSHOT';
// Set by the CI pipeline
export const BRANCH_NAME = process.env.REACT_APP_BRANCH_NAME || 'none';

export const INSTANCE_HOST = process.env.INSTANCE_HOST || 'localhost';
export const EXTERNAL_ROOT_URL = INSTANCE_HOST.startsWith('http') ? INSTANCE_HOST : `http://${INSTANCE_HOST}`;
export const EXTERNAL_URL = process.env.REACT_APP_EXTERNAL_URL || 'http://localhost';

export const BUILD_TIMEOUT = process.env.REACT_APP_BUILD_TIMEOUT || 18000;
export const POLL_TIMEOUT = process.env.REACT_APP_POLL_TIMEOUT || 10000;

