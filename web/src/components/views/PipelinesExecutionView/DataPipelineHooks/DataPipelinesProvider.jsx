import React, { createContext, useReducer } from 'react';
import DataPipelinesReducer, { initialState } from './DataPipelinesReducer';

export const DataPipelinesContext = createContext();

const Provider = ({ children, initialInformation, dataId }) => {
  const contextValue = useReducer(
    DataPipelinesReducer, {
      ...initialState,
      processorsSelected: initialInformation.dataOperatorsExecuted || [],
      isFormValid: typeof dataId !== 'undefined',
      initialInformation,
    },
  );
  return (
    <DataPipelinesContext.Provider value={contextValue}>
      {children}
    </DataPipelinesContext.Provider>
  );
};

export default Provider;
