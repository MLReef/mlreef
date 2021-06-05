import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toastr } from 'react-redux-toastr';
import { connect } from 'react-redux';
import {
  RUNNING, PENDING, PIPELINE_VIEWS_FORMAT
} from 'dataTypes';
import moment from 'moment';
import { bindActionCreators } from 'redux';
import hooks from 'customHooks/useSelectedProject';
import AuthWrapper from 'components/AuthWrapper';
import { getInfoFromStatus } from 'functions/pipeLinesHelpers';
import PropTypes, { shape, func } from 'prop-types';
import DataCard from 'components/layout/DataCard';
import Navbar from '../../navbar/navbar';
import ProjectContainer from '../../projectContainer';
import './dataInstanceDetails.scss';
import { closeModal, fireModal } from 'store/actions/actionModalActions';
import { getBranchesList } from 'store/actions/branchesActions';
import DataInstanteDeleteModal from 'components/DeleteDataInstance/DeleteDatainstance';
import actions from './DataInstanceActions';
import MLoadingSpinnerContainer from 'components/ui/MLoadingSpinner/MLoadingSpinnerContainer';
import { suscribeRT } from 'functions/apiCalls';
import JobIdLink from './JobIdLink';
import DataintanceFiles from './DatainstanceFiles';
import MTimer from 'components/ui/MTimer/MTimer';
import ACCESS_LEVEL from 'domain/accessLevels';
import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';

const timeout = 30000;

const projectApi = new ProjectGeneralInfoApi();

const mergeWithCodeProject = async (dop) => {
  const codeProject = await projectApi.getCodeProjectById(dop.project_id);
  return {
    ...dop,
    codeProject,
  }
}


const DataInstanceDetails = (props) => {
  const {
    branches,
    getBranchesList,
    match: {
      params: {
        namespace, path, slug, dataId,
      },
    },
    history,
    fireModal,
  } = props;

  const [selectedProject, isFetching] = hooks.useSelectedProject(namespace, slug);

  const { gid } = selectedProject;
  const [dataInstance, setDataInstance] = useState({});
  const timesPipelineWasFetched = useRef(0);
  
  const selectedPipeline = branches.filter((item) => item.name.includes(dataInstance?.name))[0];
  const {
    name,
    instances,
    dataOperations,
    id,
    inputFiles,
    timeCreatedAgo,
    gitlabPipelineId,
    diStatus,
    branchName,
    updatedAt,
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
  const { statusColor: statusParagraphColor } = getInfoFromStatus(diStatus);

  const duration = (new Date(updatedAt) - new Date(timeCreatedAgo));
  const showFilesInfo = diStatus === undefined || diStatus === RUNNING || diStatus === PENDING;

  const fetchPipelineInfo = useCallback(() => {
    const complete = !(diStatus === RUNNING || diStatus === PENDING);
    if(!gid || (complete && timesPipelineWasFetched.current > 0)) {
      return;
    }
  
    actions.getDataInstanceAndAllItsInformation(gid, dataId)
    .then(async (ins) => {
      const newDataOps = await Promise.all(ins.dataOperations.map(mergeWithCodeProject));
      return { ...ins, dataOperations: newDataOps }
    })
    .then((ins) => {
      setDataInstance(ins);
      timesPipelineWasFetched.current += 1;
    })
    .catch((err) => toastr.error('Error', err?.message));
  }, [gid, dataId, diStatus, gitlabPipelineId]);

  useEffect(() => suscribeRT({ timeout })(fetchPipelineInfo), [fetchPipelineInfo]);
  
  useEffect(() => {
    if(gid) {
      getBranchesList(gid);
    }
  }, [gid, path, branchName]);
  
  const customCrumbs = [
    {
      name: 'Datasets',
      href: `/${namespace}/${slug}/-/datasets`,
    },
    {
      name: `${gitlabPipelineId}`,
      href: `/${namespace}/${slug}/-/datasets/${dataId}`,
    },
  ];

  if(isFetching){
    return (
      <MLoadingSpinnerContainer active />
    )
  }

  return (
    <>
      <Navbar />
      <ProjectContainer
        activeFeature="data"
        breadcrumbs={customCrumbs}
      />
      <div className="main-content">
        <br />
        <div className="dataset-container">
          <div className="header">
            <p>Viewing</p>
          </div>
          <div className="content">
            <br />
            <div className="content-row">
              <div data-testid="dataset-branch-link" className="item">
                <p>Dataset:</p>
                <Link to={`/${namespace}/${slug}/-/tree/${encodeURIComponent(branchName)}`}>
                  <p><b>{branchName?.replace(/.*\//, '')}</b></p>
                </Link>
              </div>
              <AuthWrapper
                minRole={ACCESS_LEVEL.DEVELOPER}
              >
                <button
                  type="button"
                  style={{ padding: '0.5rem 1.3rem' }}
                  className="btn btn-danger"
                  onClick={() => {
                    fireModal({
                      title: `${isCompleted ? 'Delete': 'Abort' } ${name}`,
                      type: 'danger',
                      closable: true,
                      content: <DataInstanteDeleteModal dataInstanceName={name}/>,
                      onPositive: () => isCompleted ? actions
                        .deleteDataInstance(
                          id,
                          instances[0].id,
                        ).then(() => toastr.success('Success', 'The data instace was deleted'))
                          .then(() => history.push(`/${selectedProject?.gitlabNamespace}/${selectedProject?.slug}/-/datasets`))
                          .catch((err) => toastr.error('Error', err?.message))
                        : actions.abortDataInstance(
                          gid,
                          id,
                          instances[0].id,
                          gitlabPipelineId
                        ).then(() => toastr.success('Success', 'The data instace was aborted'))
                          .then(actions.getDataInstanceAndAllItsInformation(gid, dataId))
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
                <p>DataOps ID:</p>
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
            <div data-testid="created-time" className="content-row">
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
            <div data-testid="completed-time" className="content-row">
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
              <div data-testid="running-time" className="item">
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
              {dataOperations  && (
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
                        href: `/${namespace}/${slug}/-/repository/tree/-/commit/${commitSha}` 
                      },
                    ]}
                  />
                  </div>
                    <DataCard
                      styleClasses="model"
                      title="DataOps"
                      linesOfContent={
                        dataInstance
                          ?.dataOperations
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
                className="pipeline-view-btn btn btn-outline-dark ml-2 mb-auto"
                onClick={() => history.push(`/${namespace}/${slug}/-/datasets/${id}/rebuild`)}
              >
                View Pipeline
              </button>
            </div>
          </div>
        </div>
        <br />
        <br />
        {showFilesInfo ? (
          <>
            <table className="file-properties">
              <thead>
                <tr className="title-row">
                  <td style={{ marginLeft: '5rem' }}><p>Name</p></td>
                </tr>
              </thead>
            </table>
            <div id="empty-table">
              <p>
                No files can be shown until the pipeline has finished
              </p>
            </div>
          </>
        ) : (
          <DataintanceFiles 
            selectedProject={selectedProject}
            dataInsId={id}
            branchName={branchName}
            path={path}
          />
        )}
      </div>
    </>
  );
};

DataInstanceDetails.propTypes = {
  project: PropTypes.shape({}).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      namespace: PropTypes.string,
      path: PropTypes.string,
      dataId: PropTypes.string,
      slug: PropTypes.string,
    }).isRequired,
  }).isRequired,
  history: shape({
    push: func.isRequired,
  }).isRequired,
  branches: PropTypes.arrayOf(
    PropTypes.shape({}).isRequired,
  ).isRequired,
};

function mapStateToProps(state) {
  return {
    branches: state.branches,
  };
}

function mapActionsToProps(dispatch) {
  return {
    fireModal: bindActionCreators(fireModal, dispatch),
    closeModal: bindActionCreators(closeModal, dispatch),
    getBranchesList: bindActionCreators(getBranchesList, dispatch),
  };
}

export default connect(mapStateToProps, mapActionsToProps)(DataInstanceDetails);
