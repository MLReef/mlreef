import React, { useCallback, useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  shape, string,
} from 'prop-types';
import hooks from 'customHooks/useSelectedProject';
import MLoadingSpinner from 'components/ui/MLoadingSpinner';
import './dataVisualizationOverview.css';
import { closeModal, fireModal } from 'store/actions/actionModalActions';
import { getProjectPipelinesByType } from 'store/actions/pipelinesActions';
import MLoadingSpinnerContainer from 'components/ui/MLoadingSpinner/MLoadingSpinnerContainer';
import { generateBreadCrumbs } from 'functions/helpers';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import Instruction from '../instruction/instruction';
import DataVisualizationCard from './dataVisualizationCard';
import { filterPipelinesOnStatus } from '../../functions/pipeLinesHelpers';

export const DataVisualizationOverview = (props) => {
  const {
    match: {
      params: {
        namespace,
        slug,
      },
    },
    visualizations: vis,
  } = props;

  const [selectedProject, isFetching] = hooks.useSelectedProject(namespace, slug);
  const { id, gid } = selectedProject;
  const [visualizations, setVisualizations] = useState([]);
  const [all, setAll] = useState(vis);

  useEffect(() => {
    if (gid) {
      getProjectPipelinesByType(id, gid, 'VISUALIZATION');
    }
  }, [gid, vis]);

  const fetchVisualizations = useCallback(() => getProjectPipelinesByType(id, gid, 'VISUALIZATION'), [id, gid]);

  useEffect(() => { setAll(vis); }, [vis]);

  const customCrumbs = [
    {
      name: 'Data',
      href: `/${namespace}/${slug}`,
    },
    {
      name: 'Visualizations',
      href: `/${namespace}/${slug}/-/visualizations`,
    },
  ];

  if (isFetching) {
    return (
      <MLoadingSpinnerContainer active />
    );
  }

  return (
    <>
      <Navbar />
      <ProjectContainer
        activeFeature="data"
        breadcrumbs={generateBreadCrumbs(selectedProject, customCrumbs)}
      />
      <Instruction
        id="DataVisualizationOverview"
        titleText="Your data visualizations:"
        paragraph={
            `Here you will find all your data visualizations created by a data visualization pipeline. You can access the visualization of a pipeline
            as soon as it finished. `
          }
      />

      <div className="main-content">
        <div id="buttons-container" className="left d-flex">
          <button
            id="all"
            type="button"
            className="btn btn-switch"
            onClick={(e) => setVisualizations({ visualizations: filterPipelinesOnStatus(e, all) })}
          >
            All
          </button>
          <button
            id="InProgress"
            type="button"
            className="btn btn-switch"
            onClick={(e) => setVisualizations({ visualizations: filterPipelinesOnStatus(e, all) })}
          >
            In progress
          </button>
          <button
            id="Success"
            type="button"
            className="btn btn-switch"
            onClick={(e) => setVisualizations({ visualizations: filterPipelinesOnStatus(e, all) })}
          >
            Success
          </button>
          <button
            id="Failed"
            type="button"
            className="btn btn-switch"
            onClick={(e) => setVisualizations({ visualizations: filterPipelinesOnStatus(e, all) })}
          >
            Failed
          </button>
          <button
            id="Canceled"
            type="button"
            className="btn btn-switch"
            onClick={(e) => setVisualizations({ visualizations: filterPipelinesOnStatus(e, all) })}
          >
            Canceled
          </button>
        </div>
        {visualizations === null
          ? <div id="loading-circular-progress"><MLoadingSpinner /></div>
          : visualizations
            .filter((vis) => vis?.values?.length > 0)
            .map((dataInsClas) => (
              <DataVisualizationCard
                classification={dataInsClas}
                projectId={gid}
                namespace={namespace}
                slug={slug}
                key={dataInsClas.status}
                fireModal={fireModal}
                closeModal={closeModal}
                callback={fetchVisualizations}
              />
            ))}
      </div>
      <br />
    </>
  );
};

function mapStateToProps(state) {
  return {
    visualizations: state.visualizations,
  };
}

function mapActionsToProps(dispatch) {
  return {
    fireModal: bindActionCreators(fireModal, dispatch),
    closeModal: bindActionCreators(closeModal, dispatch),
    getProjectPipelinesByType: bindActionCreators(getProjectPipelinesByType, dispatch),
  };
}

DataVisualizationOverview.propTypes = {
  match: shape({
    params: shape({
      namespace: string.isRequired,
      slug: string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default connect(mapStateToProps, mapActionsToProps)(DataVisualizationOverview);
