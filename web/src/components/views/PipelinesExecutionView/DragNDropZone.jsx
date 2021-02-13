import React, { useContext, useEffect } from 'react';
import { arrayMove } from 'react-sortable-hoc';
import SortableProcessorsList from './SortableDataProcessorsList/SortableDataProcessorsList';
import { DataPipelinesContext } from './DataPipelineHooks/DataPipelinesProvider';
import { ADD_NEW_PROCESSOR, SET_INITIAL_OPERATORS_SELECTED, UPDATE_PROCESSORS_SELECTED, VALIDATE_FORM } from './DataPipelineHooks/actions';

const DragDropZone = (prop) => {
  const {
    prefix,
    initialDataOperators,
    isExperiment,
  } = prop;
  const [{
    processorsSelected,
    processorDataSelected,
  }, dispatch] = useContext(DataPipelinesContext);

  useEffect(() => {
    if (initialDataOperators.length > 0) {
      dispatch({ type: SET_INITIAL_OPERATORS_SELECTED, initialDataOperators });
    }
  }, []);

  const allowDrop = () => dispatch({ type: ADD_NEW_PROCESSOR });

  const onSortEnd = ({ oldIndex, newIndex }) => dispatch({
    type: UPDATE_PROCESSORS_SELECTED,
    processorsSelected: arrayMove(processorsSelected, oldIndex, newIndex),
  });

  return (
    <>
      <SortableProcessorsList prefix={prefix} onSortEnd={onSortEnd} />
      {((isExperiment && processorsSelected.length === 0) || !isExperiment) && (
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
      )}
    </>
  );
};

export default DragDropZone;
