import React from "react";
import {Redirect, Route} from 'react-router-dom'

const PrivateRoute = ({component: Component, path, ...rest}) => {
    const auth = sessionStorage.getItem("auth");
    return (
        <Route {...rest}
            exact render={(props) => auth === "true" 
                ? <Component {...props}/>
                : <Redirect to="/"/>
            }
        />
    )
}

export default PrivateRoute;