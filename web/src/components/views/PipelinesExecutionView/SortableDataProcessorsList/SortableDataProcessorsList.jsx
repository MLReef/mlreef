import React, {
  useContext,
} from 'react';
import { SortableContainer } from 'react-sortable-hoc';
import './SortableDataProcessorList.scss';
import { DataPipelinesContext } from '../DataPipelineHooks/DataPipelinesProvider';
import SortableProcessor from './SortableProcessor';

const SortableProcessorsList = SortableContainer(({
  prefix,
}) => {
  const [{ processorsSelected: items, filesSelectedInModal }] = useContext(DataPipelinesContext);
  return (
    <ul className={`${items.length > 0 ? 'p-2' : ''}`}>
      {items.map((value, index) => {
        const props = {
          value,
          index,
          prefix,
          filesSelectedInModal,
        };
        return (
          <SortableProcessor
            index={index}
            key={`item-${value.internalProcessorId}`}
            props={props}
          />
        );
      })}
    </ul>
  );
});

export default SortableProcessorsList;
