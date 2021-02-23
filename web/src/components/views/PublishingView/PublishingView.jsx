import React, { useEffect, useReducer } from 'react';
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
import { ALGORITHM } from 'dataTypes';
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
      params: { namespace, slug, path },
    },
    branches,
    history,
  } = props;

  const [selectedProject, isFetching] = hooks.useSelectedProject(namespace, slug);

  const {
    gid, id, published, dataProcessor: { type },
  } = selectedProject;

  const [{
    selectedBranch,
    files,
    entryPointFile,
    selectedEnv,
    isRequirementsFileExisting,
    model,
    mlCategory,
    areTermsAccepted,
    isPublishing,
    listOfEnvs,
  }, dispatch] = useReducer(reducer, {
    selectedBranch: branches[0].name,
    ...initialState,
  });

  const isEntryPointFormValid = entryPointFile && selectedBranch !== '';

  const isProjectAnAlgorithm = type === ALGORITHM;

  const isFinalFormValid = isProjectAnAlgorithm
    ? mlCategory && model
    : true && areTermsAccepted && isRequirementsFileExisting;

  useEffect(() => {
    if (gid) {
      filesApi.getFilesPerProject(
        gid,
        encodeURIComponent(path || ''),
        false,
        selectedBranch,
      ).then((newFilesArr) => {
        dispatch({ type: 'SET_FILES', payload: newFilesArr });
        if (!path || path === '') {
          dispatch({
            type: 'SET_REQUIREMENTS_FILE_EXISTING',
            payload: newFilesArr,
          });
        }
      }).catch((error) => toastr.error('Error', error.message));
    }
    EnvironmentsApi
      .getMany()
      .then((envs) => dispatch({ type: 'SET_LIST_OF_ENVS', payload: envs }))
      .catch((err) => toastr.error('Error', err.message));
  }, [gid, selectedBranch, path, branches]);

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
                      namespace={namespace}
                      slug={slug}
                      environments={listOfEnvs}
                      selectedEnv={selectedEnv}
                      dispatch={dispatch}
                      history={history}
                    />
                  ),
                },
                {
                  label: 'Publish model',
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
                                    path: entryPointFile.path,
                                    environment: selectedEnv.id,
                                    model_type: model?.label,
                                    ml_category: mlCategory?.label,
                                    accepted_publishing_terms: areTermsAccepted,
                                  },
                                  published,
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
                            dataProcessorType={selectedProject?.dataProcessor?.type}
                            selectedBranch={selectedBranch}
                            entryPointFile={entryPointFile}
                            selectedEnvironment={selectedEnv?.name}
                            isRequirementsFileExisting={isRequirementsFileExisting}
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
