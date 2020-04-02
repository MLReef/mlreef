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
