import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import useHistory from 'router/useHistory';
import { getWhoAmI } from 'store/actions/userActions';

const RegisterRedirectionView = () => {
  const [privateToken, setPrivateToken] = useState(null);

  const dispatch = useDispatch();
  const user = useSelector(state => state.user);

  const history = useHistory();

  useEffect(() => {
    const token = document.cookie.split('; ')
      .find(cookie => cookie.includes('PRIVATE-TOKEN'))?.split('=')[1];

    if (token) {
      setPrivateToken(token);
      dispatch(getWhoAmI({ token }));
    } else {
      toastr.warning('Warning: ', 'Login unsuccessful');
    }
  }, []);

  useEffect(() => {
    if (privateToken && user.auth) {
      toastr.success('Success:', 'Login successfully');
      const now = new Date();
      now.setMonth(now.getMonth() + 1);
      document.cookie = `private_token=${user.access_token}; expires=${now.toUTCString()};`;

      const query = window.location.search.replace(/\?(.+)$/, '$1');

      const redirect = query.split('&')
        .map((chunk) => chunk.split('='))
        .find((pair) => pair[0] === 'redirect');

      if (redirect) {
        switch (redirect[1]) {
          case 'goback':
            history.goBack();
            break;

          default:
            history.push(`/${redirect}`);
            break;
        }
      } else {
        history.push('/');
      }
    }
  }, [privateToken, user]);

  return (
    <div>
      Redirecting...
    </div>
  );
};

export default RegisterRedirectionView;
