import React, {
  useContext,
} from 'react';
import { string } from 'prop-types';
import { SortableContainer } from 'react-sortable-hoc';
import arrayMove from 'array-move';
import './SortableDataProcessorList.scss';
import { DataPipelinesContext } from '../DataPipelineHooks/DataPipelinesProvider';
import SortableProcessor from './SortableProcessor';
import { UPDATE_PROCESSORS_SELECTED } from '../DataPipelineHooks/actions';

const SortableProcessorsList = SortableContainer(({
  prefix,
  items,
}) => (
  <ul id="sortable-data-processors-list" className={`${items.length > 0 ? 'p-2' : ''}`}>
    {items.map((value, index) => (
      <SortableProcessor
        addInfo={{
          index,
          prefix,
        }}
        key={`item-${value.id}-${index.toString()}`}
        value={value}
      />
    ))}
  </ul>
));

const SortableListContainer = ({ prefix }) => {
  const [{ processorsSelected: items }, dispatch] = useContext(DataPipelinesContext);

  const onSortEnd = ({ oldIndex, newIndex }) => dispatch({
    type: UPDATE_PROCESSORS_SELECTED,
    processorsSelected: arrayMove(items, oldIndex, newIndex),
  });

  return (
    <SortableProcessorsList items={items} prefix={prefix} onSortEnd={onSortEnd} pressDelay={100} />
  );
};

SortableListContainer.propTypes = {
  prefix: string.isRequired,
};

export default SortableListContainer;
