import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import propTypes from 'prop-types';
import './AuthWrapper.css';
import { fireModal } from 'actions/actionModalActions';

const isOwner = false;
const hardcodedRole = 2;
const hardcodedAccountType = 1;

const AuthWrapper = (props) => {
  const {
    style,
    owneronly,
    role,
    accountType,
    norender,
    children,
  } = props;
  
  const history = useHistory();
  const dispatch = useDispatch();
  
  const owned = useMemo(() => owneronly ? isOwner : true, [owneronly]);
  
  const hasRole = useMemo(() => hardcodedRole >= role, [role]);

  const hasAccountType = useMemo(() => hardcodedAccountType >= accountType, [accountType]);

  const allowed = useMemo(
    () => owned && hasRole && hasAccountType,
    [owned, hasRole, hasAccountType],
  );

  const classes = useMemo(() => ({
    main: `auth-wrapper
      ${!owned ? 'ownership-required' : ''}
      ${!hasRole ? 'group-role-required' : ''}
      ${!hasAccountType ? 'project-role-required' : ''}
    `,
  }), [owned, hasRole, hasAccountType]);

  const message = useMemo(
    () => {
      if (!owned) return 'Only the owner, you can fork it!';
      if (!hasRole) return 'You need a proper role.';
      if (!hasAccountType) return 'Upgrade your account';

      return 'You need permission to use this feature';
    },
    [owned, hasRole, hasAccountType],
  );
  
  const handleClick = (e) => {    
    if (!hasAccountType) return dispatch(fireModal({
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
      onPositive: () => history.push('/account/upgrade'),    
    }));
  };

  return allowed ? children : (norender ? null : (
    <div title={message} className={classes.main} style={style}>
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
  norender: false,
  style: {},
}

AuthWrapper.propTypes = {
  owner: propTypes.bool,
  role: propTypes.number,
  accountType: propTypes.number,
  norender: propTypes.bool,
  // children:
}

export default AuthWrapper;
