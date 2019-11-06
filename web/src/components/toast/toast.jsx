import React from 'react';
import { Provider } from 'react-redux';
import ReduxToastr, { reducer } from 'react-redux-toastr';
import { createStore, combineReducers } from 'redux';
import 'react-redux-toastr/lib/css/react-redux-toastr.min.css';

const reducers = {
  toastr: reducer,
};
const fullReducer = combineReducers(reducers);
const store = createStore(fullReducer);

const ToastMessage = () => (
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
        options={{ color: '#2db391' }}
      />
    </div>
  </Provider>
);

export default ToastMessage;
