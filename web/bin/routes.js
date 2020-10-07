const fetch = require('node-fetch');
const dotenv = require('dotenv');

const config = dotenv.config();

if (config.error) {
  throw config.error;
}

const EXTERNAL_URL = config.parsed.REACT_APP_EXTERNAL_URL;
const API = `${EXTERNAL_URL}/api`;

const staticRoutes = [
  { name: '', priority: '1.00' },
  '/explore',
];

const fetchPublicProjects = () => fetch(`${API}/v1/projects`)
  .then((res) => res.status === 204 ? res : res.json())
  .then((projects) => projects.map((p) => `/${p.gitlab_namespace}/${p.slug}`));

const fetchAllSiteRoutes = () => {
  // eslint-disable-next-line
  console.log('Fetching dynamic resources...\n');

  return Promise.all([
    fetchPublicProjects(),
  ])
    .then(([projects]) => [
      ...staticRoutes,
      ...projects,
    ])
    .then((routes) => routes.map((r) => r.name !== undefined
      ? ({ ...r, name: EXTERNAL_URL + r.name })
      : EXTERNAL_URL + r));
};

fetchAllSiteRoutes();

module.exports = {
  fetchPublicProjects,
  fetchAllSiteRoutes,
};
