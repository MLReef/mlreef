import React, { createContext, useReducer } from 'react';
import DataPipelinesReducer, { initialState } from './DataPipelinesReducer';

export const DataPipelinesContext = createContext();

const Provider = ({ children, currentProcessors }) => {
  const contextValue = useReducer(DataPipelinesReducer, { ...initialState, currentProcessors });
  return (
    <DataPipelinesContext.Provider value={contextValue}>
      {children}
    </DataPipelinesContext.Provider>
  );
};

export default Provider;
