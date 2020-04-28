import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import propTypes from 'prop-types';
import './AuthWrapper.css';
import { fireModal } from 'actions/actionModalActions';
import {
  useGetOwned,
  useGetHasRole,
  useGetHasAccountType,
} from 'customHooks/permissions';

// popup's content when ask upgrade account. This is temporary and will be changed
// to a promotional image
const upgradeAccountModal = {
  type: 'info',
  title: 'Upgraded needed',
  dark: false,
  content: (
    <div className="m-auto t-center">
      <h3>Please upgrade your account!</h3>
    </div>
  ),
  positiveLabel: 'UPGRADE',
  negativeLabel: 'BACK',
};

// popup's content when suggest to fork.
const forkProjectModal = {
  type: 'info',
  title: 'You need permissions to access this feature',
  dark: false,
  content: (
    <div className="m-auto t-center">
      <h3>You can fork this project!</h3>
    </div>
  ),
  positiveLabel: 'FORK!',
  negativeLabel: 'BACK',
};

/**
 * AuthWrapper
 *
 * If passes: render the children.
 * If fails and norender is true: render nothing.
 * Else render a wrapped children with specific behaviour.
 *
 * @param {Boolean} owneronly if ownership is required.
 * @param {Number[int]} minRole the min role required https://docs.gitlab.com/ee/api/access_requests.html#valid-access-levels
 * @param {Number[int]} accountType the account level required (1 bronze, 2 silver...).
 * @param {Object[type, id]} resource if given will lookup in projects.all
 * @param {Boolean} norender if check failed then the wrapped won't be rendered.
 * @param {Object} style overwrite styles to help with positioning and apperance.
 * @param {String} className add classes to the wrapper for positioning (only if fails).
 * @param {Boolean} debug print in console a table for debug.
 * @param {node} children this is the wrapped element.
 */
const AuthWrapper = (props) => {
  const {
    owneronly,
    minRole: role,
    accountType,
    resource,
    norender,
    style,
    className,
    debug,
    children,
  } = props;

  const history = useHistory();
  const dispatch = useDispatch();

  const projectId = useSelector(({ projects: ps }) => ps.selectedProject && ps.selectedProject.id);

  // means is owner or ownership not required
  const owned = useGetOwned(owneronly, resource);

  // means has role enough high or role is not required
  const hasRole = useGetHasRole(role, resource);

  // means account tier is enough or account level is not required
  const hasAccountType = useGetHasAccountType(accountType);

  // children render normally
  const allowed = useMemo(
    () => (owned || hasRole) && hasAccountType,
    [owned, hasRole, hasAccountType],
  );

  // so far these are informative classes, no more.
  const classes = useMemo(() => ({
    main: `auth-wrapper
      ${!owned ? 'ownership-required' : ''}
      ${!hasRole ? 'group-role-required' : ''}
      ${!hasAccountType ? 'project-role-required' : ''}
    `,
  }), [owned, hasRole, hasAccountType]);

  // this will be displayed as tooltip when hover
  const message = useMemo(
    () => {
      if (!owned) return 'Only the owner, you can fork it!';
      if (!hasRole) return 'You need a proper role.';
      if (!hasAccountType) return 'Upgrade your account';

      return 'You need permission to use this feature';
    },
    [owned, hasRole, hasAccountType],
  );

  // fired if user click the cover
  const handleClick = () => {
    // if user has not enough account tier a popup will be fired
    if (!hasAccountType) return dispatch(fireModal({
      ...upgradeAccountModal,
      // this will be executed when UPGRADE button is clicked
      onPositive: () => history.push('/account/upgrade'),
    }));

    // fired of no enough permission
    if (!hasRole) return dispatch(fireModal({
      ...forkProjectModal,
      // this will be executed when FORK button is clicked
      onPositive: () => history.push(`/my-projects/${projectId}/fork`),
    }));
  };

  // this is a table that only print if debug is true
  debug && console.table({ owneronly, owned, role, hasRole, accountType, hasAccountType, allowed });

  return allowed ? children : (norender ? null : (
    <div title={message} className={`${className} ${classes.main}`} style={style}>
      <div onClick={handleClick} className="auth-wrapper-cover"></div>
      <div className="auth-wrapper-wrapped">
        {children}
      </div>
    </div>
  ));
};

AuthWrapper.defaultProps = {
  owner: false,
  role: 0,
  accountType: 0,
  resource: {
    type: 'project',
    id: 0,
  },
  norender: false,
  style: {},
  className: '',
};

AuthWrapper.propTypes = {
  owner: propTypes.bool,
  role: propTypes.number,
  accountType: propTypes.number,
  norender: propTypes.bool,
  resource: propTypes.shape({
    type: propTypes.string,
    id: propTypes.number,
  }),
  debug: propTypes.bool,
  className: propTypes.string,
  // children:
};

export default AuthWrapper;
