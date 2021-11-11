const decodeError = (errorMss) => {
  const isArray = Array.isArray(errorMss);

  if (isArray) {
    return errorMss[0];
  }

  return errorMss;
}

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
    if (body) {
      // error_message and error_name come from Backend and message comes from Gitlab
      error.name = body.error_name || res.statusText;
      error.message = decodeError(body.message) || body.error_message;
    }

    return Promise.reject(error);
  }

  return body;
};

export const generateBreadCrumbs = (selectedProject, customCrumbs, isAuth) => {
  const {
    gitlabNamespace,
    slug,
    gitlab,
    name,
  } = selectedProject;

  if (!selectedProject.name) return [];

  const userKind = gitlab?.namespace?.kind;
  let nameSpacelink = `/${gitlabNamespace}`;
  if (isAuth) {
    nameSpacelink = userKind === 'group' ? `/groups/${gitlabNamespace}` : '/dashboard/my-repositories/data_project';
  }

  const crumbs = [
    {
      name: `${gitlabNamespace}`,
      href: nameSpacelink,
    },
    {
      name: `${name}`,
      href: `/${gitlabNamespace}/${slug}`,
    },
  ];
  customCrumbs.map((crumb) => crumbs.push(crumb));
  return crumbs;
};

/**
 * copy from web/src/router/functions.js#L11
 */
export const compose = (...fns) => (arg) => fns.reverse().reduce((acc, fn) => fn(acc), arg);

/**
 * Used to replace original url provided by gitlab
 */
export const fixHostname = (url) => {
  if (!url) return '';
  const hostname = window?.location?.hostname;

  return url.replace(/^(https?:\/\/)(.+):/, `$1${hostname}:`);
};

export const toCamelCase = (stringEl) => `${stringEl[0].toUpperCase()}${stringEl.substr(1, stringEl.length - 1).toLowerCase()}`;

export const generateColor = (i) => {
  const div = 7;
  const initial = 30; // orange
  const offset = 13;
  const laps = Math.floor(i / div);
  const prev = (initial + (360 * i) / div) + (laps * offset);
  const hue = Math.round(prev % 360);

  return `hsl(${hue}, 90%, 50%)`;
};

export const delay = timeout => (arg) => new Promise(resolve => {
  setTimeout(() => resolve(arg), timeout || 1000);
});
