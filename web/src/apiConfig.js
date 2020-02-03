/**
 * This API token was generated via the Gitlab GUI.
 * This token belongs to Mlreef demo's account
 * The Token's name is INVESTOR_DEMO_TOKEN
 */
export const GITLAB_INSTANCE = process.env.REACT_APP_BACKEND !== undefined
  ? process.env.REACT_APP_BACKEND
  : process.env.REACT_APP_BACKEND_DEV;

export const MLREEF_INSTANCE = process.env.REACT_APP_MLREEF_INSTANCE_URL !== undefined
  ? process.env.REACT_APP_MLREEF_INSTANCE_URL
  : 'http://localhost:8080';
