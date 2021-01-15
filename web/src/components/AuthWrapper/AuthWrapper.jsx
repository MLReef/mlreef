import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import propTypes from 'prop-types';
import cx from 'classnames';
import './AuthWrapper.css';
import { fireModal } from 'store/actions/actionModalActions';
import {
  useGetOwned,
  useGetHasRole,
  useGetHasAccountType,
} from 'customHooks/permissions';
import { registerModal, upgradeAccountModal, forkProjectModal } from './popupInformation';

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

  const {
    user: { auth },
    projects: {
      selectedProject: { id: projectId },
    },
  } = useSelector((state) => state);

  // means is owner or ownership not required
  const owned = useGetOwned(resource);

  // means has role enough high or role is not required
  const hasRole = useGetHasRole(role, resource);

  // means account tier is enough or account level is not required
  const hasAccountType = useGetHasAccountType(accountType);

  const allowed = useMemo(
    () => auth && (!owneronly || owned) && (!role || hasRole || owned),
    [owned, owneronly, hasRole, role, auth],
  );

  // so far these are informative classes, no more.
  const classes = useMemo(
    () => ({
      main: cx('auth-wrapper', className, {
        'ownership-required': !owned,
        'group-role-required': !hasRole,
        'project-role-required': !hasAccountType,
      }),
    }),
    [owned, hasRole, hasAccountType, className],
  );

  // this will be displayed as tooltip when hover
  const message = useMemo(
    () => {
      if (!auth) return 'Please login';
      if (!owned) return 'Only the owner, you can fork it!';
      if (!hasRole) return 'You need a proper role.';
      if (!hasAccountType) return 'Upgrade your account';

      return 'You need permission to use this feature';
    },
    [owned, hasRole, hasAccountType, auth],
  );

  // fired if user click the cover
  const handleClick = () => {
    if (!auth) return dispatch(fireModal({
      ...registerModal,
      // this will be executed when UPGRADE button is clicked
      onNegative: () => history.push('/register'),
      onPositive: () => history.push('/login?redirect=goback'),
    }));
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
      onPositive: () => history.push(`/projects/${projectId}/fork`),
    }));

    return null;
  };

  // this is a table that only print if debug is true
  // eslint-disable-next-line
  debug && console.table({ owneronly, owned, role, hasRole, accountType, hasAccountType, allowed });

  // eslint-disable-next-line
  return allowed ? children : (norender ? null : (
    <div title={message} className={classes.main} style={style}>
      {/* eslint-disable-next-line */}
      <div onClick={handleClick} className="auth-wrapper-cover"></div>
      <div className="auth-wrapper-wrapped">
        {children}
      </div>
    </div>
  ));
};

AuthWrapper.defaultProps = {
  owneronly: false,
  minRole: 0,
  accountType: 0,
  resource: {
    type: 'project',
    id: 0,
  },
  norender: false,
  style: undefined,
  className: '',
};

AuthWrapper.propTypes = {
  owneronly: propTypes.bool,
  minRole: propTypes.number,
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
