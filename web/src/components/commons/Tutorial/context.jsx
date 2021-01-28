import React, { createContext, useReducer, useContext } from 'react';
import PropTypes from 'prop-types';

export const initialState = {
  dialogShown: false,
  modalShown: false,
  screen: 'index',
  tutorial: null,
  status: {
    step: 1,
    task: 1,
    done: '0:0',
  },
  meta: {},
};

export const reducer = (state, action) => {
  switch (action.type) {
    case 'SHOW_DIALOG':
      return {
        ...state,
        dialogShown: true,
      };

    case 'HIDE_DIALOG':
      return {
        ...state,
        dialogShown: false,
      };
    case 'SHOW_MODAL':
      return {
        ...state,
        modalShown: true,
      };
    case 'HIDE_MODAL':
      return {
        ...state,
        modalShown: false,
      };

    case 'SET_SCREEN':
      return {
        ...state,
        screen: action.screen,
      };

    case 'SET_TUTORIAL':
      return {
        ...state,
        tutorial: action.tutorial,
        status: action.status,
      };

    case 'SET_EXEC_TUTORIAL':
      return {
        ...state,
        tutorial: action.tutorial,
        status: action.status,
        screen: 'execution',
      };

    case 'SET_STATUS':
      return {
        ...state,
        status: action.status,
      };

    case 'SET_META':
      return {
        ...state,
        meta: action.meta,
      };

    default:
      return state;
  }
};

export const Context = createContext();

export const useContextValue = () => useContext(Context);

export const ContextProvider = ({ children }) => (
  <Context.Provider value={useReducer(reducer, initialState)}>
    {children}
  </Context.Provider>
);

ContextProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]).isRequired,
};

export default Context;
