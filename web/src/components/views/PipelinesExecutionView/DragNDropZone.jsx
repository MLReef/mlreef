import React, { useContext, useEffect } from 'react';
import { arrayMove } from 'react-sortable-hoc';
import SortableProcessorsList from './SortableDataProcessorsList/SortableDataProcessorsList';
import { DataPipelinesContext } from './DataPipelineHooks/DataPipelinesProvider';
import { ADD_NEW_PROCESSOR, SET_INITIAL_OPERATORS_SELECTED, UPDATE_PROCESSORS_SELECTED } from './DataPipelineHooks/actions';

const DragDropZone = (prop) => {
  const {
    prefix,
    initialDataOperators,
    actions,
  } = prop;
  const [{
    currentProcessors,
    processorsSelected,
    processorDataSelected,
  }, dispatch] = useContext(DataPipelinesContext);

  useEffect(() => {
    if (initialDataOperators) {
      dispatch({ type: SET_INITIAL_OPERATORS_SELECTED, initialDataOperators });
      actions.setPreconfiguredOPerations(null);
    }
  }, [currentProcessors, dispatch, initialDataOperators, processorDataSelected, actions]);

  const allowDrop = () => dispatch({ type: ADD_NEW_PROCESSOR });

  const onSortEnd = ({ oldIndex, newIndex }) => dispatch({
    type: UPDATE_PROCESSORS_SELECTED,
    processorsSelected: arrayMove(processorsSelected, oldIndex, newIndex),
  });

  return (
    <>
      <SortableProcessorsList prefix={prefix} onSortEnd={onSortEnd} />
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
