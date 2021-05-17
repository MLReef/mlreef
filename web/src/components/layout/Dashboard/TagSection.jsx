import React, { useContext, useMemo } from 'react';
import MTags from 'components/ui/MTags';
import { DashboardContext } from './DashboardContext';
import dashboardActions from './dashBoardActions';

const TagSection = () => {
  const [{
    selectedDataTypes,
    minimumStars,
    sorting,
    publishState,
  }, dispatch] = useContext(DashboardContext);

  const tags = useMemo(() => dashboardActions.buildTagsArray(
    sorting, selectedDataTypes, minimumStars, publishState,
  ), [sorting, selectedDataTypes, minimumStars, publishState]);

  return (
    <div className="dashboard-v2-content-tags">
      <MTags
        tags={tags}
        onClick={(tag) => {
          if (tag.type === 'DATA_TYPE') {
            dispatch({ type: 'SET_SELECTED_DATA_TYPE', payload: tag.id });
          } else if (tag.type === 'METRICS') {
            dispatch({ type: 'SET_MINIMUM_STARS', payload: '' });
          } else if (tag.type === 'SORTING') {
            dispatch({ type: 'SET_SORTING', payload: 0 });
          } else if (tag.type === 'PUBLISH_STATE') {
            dispatch({ type: 'SET_PUBLISH_STATE', payload: -1 });
          }
        }}
      />
    </div>
  );
};

export default TagSection;
