import React, { useEffect, useReducer } from 'react';
import { publishedStateOptions, sortingOPtions } from './constants';

export const reducer = (state, { type, payload }) => {
  switch (type) {
    case 'SET_SELECTED_DATA_TYPE':
      return {
        ...state,
        selectedDataTypes: state.selectedDataTypes.includes(payload)
          ? state.selectedDataTypes.filter((sdt) => sdt !== payload)
          : [...state.selectedDataTypes, payload],
      };
    case 'SET_MINIMUM_STARS':
      return {
        ...state,
        minimumStars: payload,
      };
    case 'SET_SORTING':
      return {
        ...state,
        sorting: payload,
      };
    case 'SET_PUBLISH_STATE':
      return {
        ...state,
        publishState: payload,
      };
    default:
      return state;
  }
};

export const DashboardContext = React.createContext();

const DashboardProvider = ({ children }) => {
  const initialState = JSON.parse(sessionStorage.getItem('dashboard-filterings')) || {
    selectedDataTypes: [],
    minimumStars: '',
    sorting: sortingOPtions[0],
    publishState: publishedStateOptions[0],
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    sessionStorage.setItem('dashboard-filterings', JSON.stringify(state));
  }, [state]);

  return (
    <DashboardContext.Provider value={[
      state,
      dispatch,
    ]}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardProvider;
