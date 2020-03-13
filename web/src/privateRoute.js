import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';

const PrivateRoute = ({ component: Component, path, ...rest }) => {
  // tries to get auth from redux state if not goes old way
  const user = useSelector((state) => state.user);
  const auth = !!user.auth;

  return (
    <Route
      {...rest}
      exact
      render={(props) => (auth === true
        ? <Component {...props} />
        : <Redirect to="/" />)}
    />
  );
};

export default PrivateRoute;
