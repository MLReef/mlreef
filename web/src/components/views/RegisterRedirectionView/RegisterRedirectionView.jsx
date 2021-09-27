import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import useHistory from 'router/useHistory';
import { getWhoAmI } from 'store/actions/userActions';

export const RegisterRedirectionView = () => {

    const [PrivateToken, setPrivateToken] = useState(null);

    const dispatch = useDispatch();
    const user = useSelector(state => state.user);

    const history = useHistory();

    useEffect(() => {
        const Token = document.cookie.split('; ').find(cookie => cookie.includes('PRIVATE-TOKEN'))?.split('=')[1];
        if(Token){
            setPrivateToken(Token);
            dispatch(getWhoAmI());
        }else{
            toastr.warning('Warning: ', 'Login unsuccessful');
        }
    }, []);

    useEffect(() => {
        if(PrivateToken && user.auth){
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
                    return history.goBack();

                default:
                    return history.push(`/${redirect}`);
                }
            }

            return history.push('/');
        }
    }, [PrivateToken, user])

    return (
        <div>
            Redirecting...
        </div>
    )
}
