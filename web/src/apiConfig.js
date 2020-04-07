// API_GATEWAY should be the url to your instance otherwise the develop url
export const API_GATEWAY = process.env.REACT_APP_API_GATEWAY || 'http://ec2-54-93-41-189.eu-central-1.compute.amazonaws.com';
export const GITLAB_PORT = process.env.REACT_APP_GITLAB_PORT || '10080';
export const BUILD_TIMEOUT = process.env.REACT_APP_BUILD_TIMEOUT || 18000;
export const POLL_TIMEOUT = process.env.REACT_APP_POLL_TIMEOUT || 10000;
