import React, { useEffect, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import FilesApi from 'apis/FilesApi';
import Navbar from 'components/navbar/navbar';
import MBreadcrumb from 'components/ui/MBreadcrumb';
import MButton from 'components/ui/MButton';
import MSimpleTabs from 'components/ui/MSimpleTabs/MSimpleTabsRouted';
import hooks from 'customHooks/useSelectedProject';
import EnvironmentsApi from 'apis/EnvironmentsApi';
import './PublishingView.scss';
import MLoadingSpinnerContainer from 'components/ui/MLoadingSpinner/MLoadingSpinnerContainer';
import { ALGORITHM, OPERATION } from 'dataTypes';
import GitlabPipelinesApi from 'apis/GitlabPipelinesApi';
import PublishingViewPublishModel from './PublishingViewPublishModel';
import initialState, { reducer } from './stateManagement';
import SelectBaseEnv from './SelectBaseEnv/SelectBaseEnv';
import SelectEntryPoint from './SelectEntryPoint/SelectEntryPoint';
import publishingActions from './publishingActions';
import InterludeView from './InterludeView';

const filesApi = new FilesApi();

const gitlabPipelinesApi = new GitlabPipelinesApi();

export const UnconnectedPublishingView = (props) => {
  const {
    match: {
      params: { namespace, slug, branch },
    },
    branches,
    history,
  } = props;

  const [selectedProject, isFetching] = hooks.useSelectedProject(namespace, slug);

  const {
    gid, id, processorType, processors,
  } = selectedProject;

  const finalBranch = useMemo(() => branch || branches[0].name, []);

  const [{
    path,
    selectedBranch,
    files,
    entryPointFile,
    selectedEnv,
    requirementsFile,
    model,
    mlCategory,
    areTermsAccepted,
    isPublishing,
    listOfEnvs,
  }, dispatch] = useReducer(reducer, {
    selectedBranch: finalBranch,
    ...initialState,
  });

  const isEntryPointFormValid = !!entryPointFile && selectedBranch !== '';

  const isProjectAnAlgorithm = processorType === ALGORITHM;

  let operationToPublishType;

  switch (processorType) {
    case ALGORITHM:
      operationToPublishType = 'model';
      break;
    case OPERATION:
      operationToPublishType = 'operation';
      break;
    default:
      operationToPublishType = 'visualization';
      break;
  }

  const isFinalFormValid =  
    areTermsAccepted && !!requirementsFile && (isProjectAnAlgorithm ? !!model && !!mlCategory : true);

  useEffect(() => {
    EnvironmentsApi
    .getMany()
    .then((envs) => dispatch({ type: 'SET_LIST_OF_ENVS', payload: envs }))
    .catch((err) => toastr.error('Error', err.message));
  }, []);

  useEffect(() => {
    if (gid) {
      filesApi.getFilesPerProject(
        gid,
        encodeURIComponent(path || ''),
        false,
        selectedBranch,
      ).then((newFilesArr) => {
        dispatch({ type: 'SET_FILES', payload: newFilesArr });
      }).catch((error) => toastr.error('Error', error.message));
    }
  }, [gid, selectedBranch, path, branches]);

  useEffect(() => {
    filesApi.getFileData(
      gid,
      'requirements.txt',
      selectedBranch,
    ).then((file) => {
      dispatch({ type: 'SET_REQUIREMENTS_FILE', payload: file });
    }).catch(() => {
      toastr.info("No Requirements.txt file found.", "Create or place it on root level.");
    });
  }, [selectedBranch]);

  const breadcrumbs = [
    {
      name: namespace,
      href: '/',
    },
    {
      name: slug,
      href: `/${namespace}/${slug}`,
    },
    {
      name: 'Publishing',
    },
  ];

  if (isFetching) {
    return (
      <MLoadingSpinnerContainer active />
    );
  }
  
  return (
    <div className="publishing-view">
      <Navbar />
      <MBreadcrumb className="bg-light px-3" items={breadcrumbs} />
      {isPublishing ? (
        <InterludeView />
      ) : (
        <div className="publishing-view pt-4">
          <div className="publishing-view-content">
            <MSimpleTabs
              steps
              sections={[
                {
                  label: 'Select entry point and branch',
                  done: isEntryPointFormValid,
                  defaultActive: true,
                  content: (
                    <SelectEntryPoint
                      entryPointFile={entryPointFile}
                      files={files}
                      branches={branches}
                      selectedBranch={selectedBranch}
                      path={path}
                      namespace={namespace}
                      slug={slug}
                      dispatch={dispatch}
                    />
                  ),
                },
                {
                  label: 'Select base environment',
                  done: !!selectedEnv,
                  disabled: !isEntryPointFormValid,
                  content: (
                    <SelectBaseEnv
                      operationType={operationToPublishType}
                      namespace={namespace}
                      slug={slug}
                      environments={listOfEnvs}
                      selectedEnv={selectedEnv}
                      selectedBranch={selectedBranch}
                      dispatch={dispatch}
                      history={history}
                    />
                  ),
                },
                {
                  label: `Publish ${operationToPublishType}`,
                  done: false,
                  disabled: !isEntryPointFormValid || !selectedEnv,
                  content: (
                    <div style={{ minHeight: '60vh' }}>
                      <div className="row">
                        <div className="col-3" />
                        <div className="col-6">
                          <div className="statement">
                            <div className="statement-title">
                              Review publishing pipeline
                            </div>
                            <div className="statement-subtitle">
                              MLReef provides a set of base environment images including
                              a set of pre-installed packages. Select one, that works best
                              with your code!
                            </div>
                          </div>
                        </div>
                        <div className="col-3 pl-3">
                          <div className="publishing-view-summary">
                            {isProjectAnAlgorithm && (
                            <div className="parameter mb-3">
                              <span className="parameter-key">
                                Status to publish:
                              </span>
                              <strong className="parameter-value t-danger">
                                {model ? model.label : 'No model type'}
                              </strong>
                            </div>
                            )}
                            <MButton
                              type="button"
                              disabled={!isFinalFormValid}
                              waiting={isPublishing}
                              onClick={() => {
                                dispatch({ type: 'SET_IS_PUBLISHING', payload: true });
                                publishingActions.publish(
                                  id, {
                                    slug,
                                    path: entryPointFile?.path,
                                    requirements_file: requirementsFile?.file_path,
                                    environment: selectedEnv?.id,
                                    branch: selectedBranch,
                                    version: publishingActions.getNextVersion(
                                      processors,
                                      selectedBranch,
                                    ),
                                    model_type: model?.label,
                                    ml_category: mlCategory?.label,
                                    accepted_publishing_terms: areTermsAccepted,
                                  },
                                )
                                  .then(() => {
                                    setTimeout(async () => {
                                      const pipes = await gitlabPipelinesApi
                                        .getPipesByProjectId(gid);
                                      toastr.success('Success', 'Your project is being published');
                                      history.push(`/${namespace}/${slug}/-/publications/${pipes[0]?.id}`);
                                    }, 5000);
                                  })
                                  .catch((err) => {
                                    dispatch({ type: 'SET_IS_PUBLISHING', payload: false });
                                    toastr.error('Error', err.message);
                                  });
                              }}
                              className="btn btn-dark"
                            >
                              Publish
                            </MButton>
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-2" />
                        <div className="col-10">
                          <PublishingViewPublishModel
                            dataProcessorType={processorType}
                            selectedBranch={selectedBranch}
                            entryPointFile={entryPointFile}
                            selectedEnvironment={selectedEnv?.title}
                            isRequirementsFileExisting={!!requirementsFile}
                            areTermsAccepted={areTermsAccepted}
                            model={model}
                            category={mlCategory}
                            dispatch={dispatch}
                          />
                        </div>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
};

UnconnectedPublishingView.defautProps = {

};

UnconnectedPublishingView.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      namespace: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      path: PropTypes.string,
    }).isRequired,
  }).isRequired,
  project: PropTypes.shape({}).isRequired,
  branches: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })).isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

function mapStateToProps({ branches }) {
  return {
    branches,
  };
}

export default connect(mapStateToProps)(UnconnectedPublishingView);
