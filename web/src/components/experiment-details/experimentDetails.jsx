import React, { useState, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { toastr } from 'react-redux-toastr';
import {
  shape,
  arrayOf,
  string,
  func,
} from 'prop-types';
import './experimentDetails.css';
import ExperimentsApi from 'apis/experimentApi';
import JobsApi from 'apis/JobsApi';
import MSimpleTabs from 'components/ui/MSimpleTabs';
import { setPreconfiguredOPerations } from 'store/actions/userActions';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import DetailsSummary from './menu-options/DetailSummary';
import Files from './menu-options/ExperimentArtifacts';
import JobLog from './menu-options/jobLog';

const expApi = new ExperimentsApi();
const jobsApi = new JobsApi();

const ExperimentDetails = (props) => {
  const [experiment, setExperiment] = useState({});
  const [jobs, setJobs] = useState([]);
  const {
    projects,
    algorithms,
    match: { params: { namespace, slug, experimentId } },
    setPreconfiguredOPerations,
    history,
  } = props;
  const selectedProject = projects.filter((proj) => proj.slug === slug)[0];
  const projectId = selectedProject?.gitlabId;
  const backendId = selectedProject?.id;
  const userKind = selectedProject?.gitlab?.namespace?.kind;
  const name = selectedProject?.name;
  const userParameters = experiment?.processing?.parameters;
  const expSlug = experiment?.processing?.slug;
  const { pipeline_job_info: pipelineInfo } = experiment;
  let mergedParameters;
  const allParameters = algorithms
    .filter((alg) => alg.slug === expSlug)
    .map((alg) => alg.parameters)[0];
  const experimentName = experiment.name;
  const uniqueName = experimentName && experimentName.split('/')[1];
  const experimentJob = jobs.filter((job) => job.ref === experiment.name)[0];
  useEffect(() => {
    jobsApi.getPerProject(projectId)
      .then((js) => setJobs(js))
      .catch((err) => toastr.error('Error', err.message));
  }, [projectId]);
  // Union of two arrays of parameters
  if (userParameters && allParameters) {
    const mergedArray = [...userParameters, ...allParameters];
    const set = new Set();
    mergedParameters = mergedArray.filter((item) => {
      const isItemInSet = !set.has(item.name);
      if (isItemInSet) set.add(item.name);
      return isItemInSet;
    }, set);
  }

  useEffect(() => {
    expApi.getExperimentDetails(backendId, experimentId)
      .then((res) => setExperiment(res))
      .catch(() => toastr.error('Error', 'Could not fetch the experiment'));
  }, [backendId, experimentId]);

  const breadcrumbs = useMemo(
    () => [
      {
        name: namespace,
        href: userKind === 'group' ? `/groups/${namespace}` : `/${namespace}`,
      },
      {
        name,
        href: `/${namespace}/${slug}`,
      },
      {
        name: 'Experiments',
        href: `/${namespace}/${slug}/-/experiments`,
      },
      {
        name: uniqueName,
      },
    ],
    [namespace, slug, name, uniqueName, userKind],
  );

  return (
    <>
      <Navbar />
      <ProjectContainer
        project={selectedProject}
        activeFeature="experiments"
        breadcrumbs={breadcrumbs}
      />
      <div className="main-content mt-4">
        <MSimpleTabs
          vertical
          pills
          sections={[
            {
              label: 'Details',
              content: experimentJob && (
                <DetailsSummary
                  projectNamespace={namespace}
                  projectSlug={slug}
                  projectId={projectId}
                  inputFiles={experiment.input_files}
                  dataOperatorsExecuted={experiment.processing}
                  experimentName={uniqueName}
                  parameters={mergedParameters}
                  pipelineInfo={pipelineInfo}
                  setPreconfiguredOPerations={setPreconfiguredOPerations}
                  history={history}
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
  algorithms: arrayOf(shape({})).isRequired,
  projects: arrayOf(shape({})).isRequired,
  match: shape({
    params: shape({
      experimentId: string.isRequired,
    }).isRequired,
  }).isRequired,
  setPreconfiguredOPerations: func.isRequired,
  history: shape({}).isRequired
};

function mapStateToProps(state) {
  return {
    projects: state.projects.all,
    algorithms: state.processors.algorithms,
  };
}

function mapActionsToProps(dispatch) {
  return {
    setPreconfiguredOPerations: bindActionCreators(setPreconfiguredOPerations, dispatch),
  };
}


export default connect(mapStateToProps, mapActionsToProps)(ExperimentDetails);
