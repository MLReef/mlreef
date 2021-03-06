import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toastr } from 'react-redux-toastr';
import { connect } from 'react-redux';
import {
  shape, string, arrayOf, func,
} from 'prop-types';
import AuthWrapper from 'components/AuthWrapper';
import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import { RUNNING, PENDING, PIPELINE_VIEWS_FORMAT } from 'dataTypes';
import moment from 'moment';
import DataCard from 'components/layout/DataCard';
import { bindActionCreators } from 'redux';
import { closeModal, fireModal } from 'store/actions/actionModalActions';
import { getBranchesList } from 'store/actions/branchesActions';
import DataInstanteDeleteModal from 'components/DeleteDataInstance/DeleteDatainstance';
import './dataVisualizationDetail.scss';
import Navbar from '../../navbar/navbar';
import ProjectContainer from '../../projectContainer';
import actions from '../Datainstances/DataInstanceActions';
import hooks from 'customHooks/useSelectedProject';
import MLoadingSpinnerContainer from 'components/ui/MLoadingSpinner/MLoadingSpinnerContainer';
import DataVisualizationFiles from './DataVisualizationFiles';
import { suscribeRT } from 'functions/apiCalls';
import JobIdLink from '../Datainstances/JobIdLink';
import { getInfoFromStatus } from 'functions/pipeLinesHelpers';
import MTimer from 'components/ui/MTimer/MTimer';

const timeout = 30000;

const projectApi = new ProjectGeneralInfoApi();

const mergeWithCodeProject = async (dop) => {
  const codeProject = await projectApi.getCodeProjectById(dop.project_id);
  return {
    ...dop,
    codeProject,
  }
}

const DataVisualizationDetails = (props) => {
  const {
    branches,
    match: {
      params: {
        path, visId, namespace, slug,
      },
    },
    history,
    fireModal,
    getBranchesList,
  } = props;
  const [dataInstance, setDataInstance] = useState({});
  const selectedPipeline = branches.filter((item) => item.name.includes(dataInstance?.name))[0];
  const timesPipelineWasFetched = useRef(0);

  const [selectedProject, isFetching] = hooks.useSelectedProject(namespace, slug);

  const { gid, } = selectedProject;

  const {
    instances,
    id,
    inputFiles,
    dataOperations,
    timeCreatedAgo,
    gitlabPipelineId,
    diStatus,
    branchName,
    updatedAt
  } = dataInstance;

  let commitSha;
  let inputFilePath;
  if(instances) {
    commitSha = instances[0].pipeline_job_info?.commit_sha;
    inputFilePath = inputFiles[0].location?.toString();
  }
  const basePath = `${namespace}/${slug}`;
  const linkToRepoView = `/${basePath}/-/repository/tree/-/commit/${commitSha}`;

  const isCompleted = !(diStatus === RUNNING || diStatus === PENDING);
  const duration = (new Date(updatedAt) - new Date(timeCreatedAgo));

  const { statusColor: statusParagraphColor } = getInfoFromStatus(diStatus);

  const fetchPipelineInfo = useCallback(() => {
    const complete = !(diStatus === RUNNING || diStatus === PENDING);
    if(!gid || (complete && timesPipelineWasFetched.current > 0)) {
      return;
    }
  
    actions.getDataInstanceAndAllItsInformation(gid, visId)
    .then(async (ins) => {
      const newDataOps = await Promise.all(ins.dataOperations.map(mergeWithCodeProject));
      return { ...ins, dataOperations: newDataOps }
    })
    .then((ins) => {
      setDataInstance(ins);
      timesPipelineWasFetched.current += 1;
    })
    .catch((err) => toastr.error('Error', err?.message));
  }, [gid, visId, diStatus]);

  useEffect(() => suscribeRT({ timeout })(fetchPipelineInfo), [fetchPipelineInfo]);

  useEffect(() => {
    if(gid){
      getBranchesList(gid);
    }
  }, [gid]);

  const customCrumbs = [
    {
      name: 'Data',
      href: `/${namespace}/${slug}`,
    },
    {
      name: 'Visualizations',
      href: `/${namespace}/${slug}/-/visualizations`,
    },
    {
      name: `${gitlabPipelineId}`,
      href: `/${namespace}/${slug}/-/visualizations/${visId}`,
    },
  ];

  if (isFetching) {
    return (
      <MLoadingSpinnerContainer active />
    );
  }

  return (
    <div>
      <Navbar />
      <ProjectContainer
        activeFeature="data"
        breadcrumbs={customCrumbs}
      />
      <div className="main-content">
        <br />
        <div className="visualization-container">
          <div className="header">
            <p><b>Viewing your data visualization</b></p>
          </div>
          {selectedPipeline && (
          <div className="content">
            <br />
            <div className="content-row">
              <div data-testid="dataset-branch-link" className="item">
                <p>Visualization:</p>
                <Link to={`/${namespace}/${slug}/-/tree/${encodeURIComponent(branchName)}`}>
                  <p><b>{branchName?.replace(/.*\//, '')}</b></p>
                </Link>
              </div>
              <AuthWrapper
                minRole={30}
              >
                <button
                  type="button"
                  style={{ padding: '0.5rem 1.3rem' }}
                  className="btn btn-danger"
                  onClick={() => {
                    fireModal({
                      title: `${isCompleted ? 'Delete': 'Abort' } ${branchName}`,
                      type: 'danger',
                      closable: true,
                      content: <DataInstanteDeleteModal dataInstanceName={branchName}/>,
                      onPositive: () => isCompleted ? actions
                        .deleteDataInstance(
                          id,
                          instances[0].id,
                        ).then(() => toastr.success('Success', 'The data instace was deleted'))
                          .then(() => history.push(`/${selectedProject?.gitlabNamespace}/${selectedProject?.slug}/-/visualizations`))
                          .catch((err) => toastr.error('Error', err?.message))
                        : actions.abortDataInstance(
                          gid,
                          id,
                          instances[0].id,
                          gitlabPipelineId
                        ).then(() => toastr.success('Success', 'The data instace was aborted'))
                          .then(actions.getDataInstanceAndAllItsInformation(gid, visId))
                          .then(setDataInstance)
                        .catch((err) => toastr.error('Error', err?.message))
                      })
                  }}
                >
                  <b>{isCompleted ? 'X' : 'Abort'}</b>
                </button>
              </AuthWrapper>
            </div>
            <div className="content-row">
              <JobIdLink
                gid={gid}
                gitlabPipelineId={gitlabPipelineId}
                namespace={namespace}
                slug={slug}
                statusParagraphColor={statusParagraphColor}
                diStatus={diStatus}
              />
              <div className="item">
                <p>Visualization ID:</p>
                <span style={{
                  border: '1px solid gray',
                  padding: '2px 0.5rem 0 2rem',
                  borderRadius: '0.2rem',
                }}
                >
                  {gitlabPipelineId}
                </span>
              </div>
            </div>
            <br />
            <div className="content-row">
              <div className="item">
                <p>
                  Created:
                </p>
                <p>
                  <b>
                    {moment(timeCreatedAgo).format(PIPELINE_VIEWS_FORMAT)}
                  </b>
                </p>
              </div>
            </div>
            <div className="content-row">
              <div className="item">
                <p>
                  Completed:
                </p>
                <p>
                  <b>
                    {isCompleted ? moment(updatedAt).format(PIPELINE_VIEWS_FORMAT) : '---'}
                  </b>
                </p>
              </div>
              <div className="item">
                <p>
                  Running time:
                </p>
                <p>
                  <b>
                  {isCompleted
                      ? moment({}).startOf('day').milliseconds(duration).format('HH:mm:ss')
                      : <MTimer startTime={timeCreatedAgo} />
                    }
                  </b>
                </p>
              </div>
            </div>
            <div className="content-row">
              <div className="item">
                <p>
                  Owner:
                </p>
                <p>
                  <Link to={`/${selectedPipeline?.commit?.author_name}`}>
                    <b>
                      {selectedPipeline?.commit?.author_name}
                    </b>
                  </Link>
                </p>
              </div>
            </div>
            <div className="p-4 data-tabs">
              {dataOperations && (
                <>
                <div>
                  <DataCard
                    title="Data"
                    linesOfContent={[
                      { text: 'Files selected from path' },
                      {
                        text: `*${inputFiles ? inputFiles[0].location : ''}`,
                        isLink: true,
                        href: inputFiles[0].location_type === 'PATH_FILE'
                          ? `/${basePath}/-/blob/commit/${commitSha}/path/${inputFilePath}`
                          : `${linkToRepoView}/path/${inputFilePath}`,
                      },
                      { text: 'from' },
                      { 
                        text: `*${branchName?.replace(/.*\//, '')}`,
                        isLink: true,
                        href: `/${namespace}/${slug}/-/repository/tree/-/commit/${commitSha}`,
                      },
                    ]}
                  />
                  </div>
                    <DataCard
                      styleClasses="visualization"
                      title="Data Visualization pipeline"
                      linesOfContent={
                          dataOperations
                          ?.map((op, opInd) => ({
                            text: `*Op. ${opInd} - ${op.name}`,
                            isLink: true,
                            href: `/${op.codeProject.gitlab_namespace}/${op.codeProject.slug}`
                          }))
                      }
                    />
                </>
              )}
              <button
                type="button"
                className="btn btn-outline-dark ml-2 mb-auto"
                onClick={() => history.push(`/${namespace}/${slug}/-/visualizations/${dataInstance?.id}/rebuild`)}
              >
                View Pipeline
              </button>
            </div>
          </div>
          )}
        </div>
        <br />
        <DataVisualizationFiles 
          gid={gid}
          namespace={namespace}
          slug={slug}
          branchName={branchName}
          path={path}
        />
      </div>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    branches: state.branches,
  };
}


DataVisualizationDetails.propTypes = {
  project: shape({}).isRequired,
  branches: arrayOf(shape({})).isRequired,
  match: shape({
    params: shape({
      gid: string.isRequired,
      path: string,
      visId: string.isRequired,
    }).isRequired,
  }).isRequired,
  history: shape({
    push: func.isRequired,
  }).isRequired,
};

function mapActionsToProps(dispatch) {
  return {
    fireModal: bindActionCreators(fireModal, dispatch),
    closeModal: bindActionCreators(closeModal, dispatch),
    getBranchesList: bindActionCreators(getBranchesList, dispatch),
  };
}

export default connect(mapStateToProps, mapActionsToProps)(DataVisualizationDetails);
