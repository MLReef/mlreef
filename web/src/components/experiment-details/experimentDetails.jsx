import React, { useState, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import {
  shape,
  arrayOf,
  string,
} from 'prop-types';
import './experimentDetails.css';
import ExperimentsApi from 'apis/experimentApi';
import MSimpleTabs from 'components/ui/MSimpleTabs';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import DetailsSummary from './menu-options/DetailSummary';
import Files from './menu-options/files';
import JobLog from './menu-options/jobLog';

const expApi = new ExperimentsApi();

const ExperimentDetails = (props) => {
  const [experiment, setExperiment] = useState({});

  const {
    selectedProject,
    jobs,
    selectedProject: { gitlabName: name },
    match: { params: { projectId } },
    location: {
      state: {
        uuid, currentState, userParameters, pipelineInfo, experimentId, allParameters,
      },
    },
  } = props;
  const groupName = selectedProject.namespace;
  const experimentName = experiment.name;
  const uniqueName = experimentName && experimentName.split('/')[1];
  let experimentJob;
  const firstInd = 0;
  if (experiment) {
    experimentJob = jobs.filter((job) => job.ref === experiment.name)[firstInd];
  }

  // Union of two arrays of parameters
  const mergedArray = [...userParameters, ...allParameters];
  const set = new Set();
  const mergedParameters = mergedArray.filter((item) => {
    if (!set.has(item.name)) {
      set.add(item.name);
      return true;
    }
    return false;
  }, set);

  useEffect(() => {
    expApi.getExperimentDetails(uuid, experimentId)
      .then((res) => setExperiment(res))
      .catch(() => toastr.error('Error', 'Could not fetch the experiment'));
  }, [uuid, experimentId]);

  // this got orphan after refactoring renderTheSelectedSection()
  // <DetailsSummary experiment={experiment} experimentName={uniqueName} />

  const breadcrumbs = useMemo(
    () => [
      {
        name: groupName,
      },
      {
        name,
        href: `/${groupName}/${name}`,
      },
      {
        name: 'Experiments',
        href: `/${groupName}/${name}/-/experiments`,
      },
      {
        name: uniqueName,
      },
    ],
    [groupName, name, uniqueName],
  );

  return (
    <>
      <Navbar />
      <ProjectContainer
        project={selectedProject}
        activeFeature="experiments"
        folders={[groupName, name, 'Experiments', 'Details']}
        breadcrumbs={breadcrumbs}
      />
      <div className="main-content mt-4">
        <MSimpleTabs
          vertical
          pills
          sections={[
            {
              label: 'Details',
              content: experiment && experimentJob && (
                <DetailsSummary
                  projectId={projectId}
                  experiment={experiment}
                  currentState={currentState}
                  experimentName={uniqueName}
                  parameters={mergedParameters}
                  pipelineInfo={pipelineInfo}
                  experimentJob={experimentJob}
                />
              ),
              defaultActive: true,
            },
            {
              label: 'Training',
              content: experimentJob && (
                <JobLog
                  projectId={parseInt(projectId, 10)}
                  currentState={experimentJob && experimentJob.status}
                  job={experimentJob}
                />
              ),
            },
            {
              label: 'Files',
              content: projectId && experimentJob && (
                <Files projectId={projectId} job={experimentJob} />
              ),
            },
          ]}
        />
      </div>
    </>
  );
};

ExperimentDetails.propTypes = {
  selectedProject: shape({
    gitlabName: string.isRequired,
  }).isRequired,
  location: shape({
    state: shape({
      uuid: string.isRequired,
      currentState: string.isRequired,
      pipelineInfo: shape.isRequired,
      userParameters: arrayOf.isRequired,
    }).isRequired,
  }).isRequired,
  match: shape({
    params: shape({
      projectId: string.isRequired,
      experimentId: string.isRequired,
    }).isRequired,
  }).isRequired,
  jobs: arrayOf(shape({})).isRequired,
};

function mapStateToProps(state) {
  return {
    jobs: state.jobs,
    selectedProject: state.projects.selectedProject,
    algorithms: state.processors.algorithms,
  };
}

export default connect(mapStateToProps)(ExperimentDetails);
