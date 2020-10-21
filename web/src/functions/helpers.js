/**
 * Run before create
 */
const checkVersion = () => {
  const version = process.env.REACT_APP_VERSION;
  const prevVersion = localStorage.getItem('app:version');
  if (version && prevVersion && !(version.toString() === prevVersion.toString())) {
    localStorage.clear();
  }

  localStorage.setItem('app:version', version);
};

export default checkVersion;


// this returns an error if code is bigger than 400
// added an extra guard to avoid failing by bad json parsing
export const handleResponse = async (res) => {
  let body;
  const NO_CONTENT_STATUS = 204;
  if (res.status !== NO_CONTENT_STATUS) {
    body = await res.json();
  }
  if (!res.ok) {
    const error = new Error();
    error.name = res.statusText;
    error.status = res.status;
    error.message = body ? body.message : '';
    return Promise.reject(error);
  }

  return body;
};

export const generateBreadCrumbs = (selectedProject, customCrumbs) => {
  const {
    namespace,
    slug,
    gitlab,
    gitlabName,
  } = selectedProject;
  const userKind = gitlab?.namespace?.kind;
  const crumbs = [
    {
      name: `${namespace}`,
      href: userKind === 'group' ? `/groups/${namespace}` : `/${namespace}`,
    },
    {
      name: `${gitlabName}`,
      href: `/${namespace}/${slug}`,
    },
  ];
  customCrumbs.map((crumb) => crumbs.push(crumb));
  return crumbs;
};
