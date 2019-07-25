import React from "react";
import {Redirect, Route} from 'react-router-dom'

const PrivateRoute = ({component: Component, path, auth, ...rest}) => {
    return (
        <Route {...rest}
            render={(props) => auth === "true"
                ? <Component {...props}/>
                : <Redirect to="/login"/>
            }
        />
    )
}

export default PrivateRoute;