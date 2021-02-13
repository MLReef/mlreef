import React, { createContext, useReducer } from 'react';
import DataPipelinesReducer, { initialState } from './DataPipelinesReducer';

export const DataPipelinesContext = createContext();

const Provider = ({ children, currentProcessors, initialInformation }) => {
  const contextValue = useReducer(
    DataPipelinesReducer, {
      ...initialState,
      initialInformation,
      currentProcessors,
    },
  );
  return (
    <DataPipelinesContext.Provider value={contextValue}>
      {children}
    </DataPipelinesContext.Provider>
  );
};

export default Provider;
