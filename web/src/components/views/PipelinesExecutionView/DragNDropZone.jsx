import React, { useContext } from 'react';
import SortableListContainer from './SortableDataProcessorsList/SortableDataProcessorsList';
import { DataPipelinesContext } from './DataPipelineHooks/DataPipelinesProvider';
import { ADD_NEW_PROCESSOR } from './DataPipelineHooks/actions';

const DragDropZone = (prop) => {
  const {
    isExperiment,
  } = prop;
  const [{
    processorsSelected,
    processorDataSelected,
    filesSelectedInModal,
  }, dispatch] = useContext(DataPipelinesContext);

  let prefix = 'Op.';

  if (isExperiment) {
    prefix = 'Model.';
  }

  const allowDrop = () => dispatch({ type: ADD_NEW_PROCESSOR });

  if (filesSelectedInModal.length === 0) {
    return <></>;
  }

  return (
    <>
      <SortableListContainer prefix={prefix} />
      <div
        id="drop-zone"
        className={`drop-zone d-flex ml-1 ${processorDataSelected ? 'moving' : ''}`}
        onDragEnter={allowDrop}
      >
        <p className="drop-zone-operation-counter">
          {`${prefix}${processorsSelected.length + 1}:`}
        </p>
        <i className="drop-zone-ico fas fa-plus" />
        <p className="drop-zone-instruction">
          Drag and drop an operator from the right
          <br />
          list
        </p>
      </div>
    </>
  );
};

export default DragDropZone;
