import React from "react";
import {Provider}  from 'react-redux';
import ReduxToastr from 'react-redux-toastr';
import {createStore, combineReducers} from 'redux';
import {reducer as toastrReducer} from 'react-redux-toastr';
import 'react-redux-toastr/lib/css/react-redux-toastr.min.css';

const reducers = {
  toastr: toastrReducer
}
const reducer = combineReducers(reducers)
const store = createStore(reducer)

const ToastMessage = () => 
    <Provider store={store}>
        <div>
            <ReduxToastr
                timeOut={10000}
                newestOnTop={false}
                preventDuplicates
                position="bottom-right"
                transitionIn="fadeIn"
                transitionOut="fadeOut"
                progressBar
                closeOnToastrClick
                options={{color:'#2db391'}}
            />
        </div>
    </Provider>

export default ToastMessage;