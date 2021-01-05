import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import FilesApi from 'apis/FilesApi';
import Navbar from 'components/navbar/navbar';
import MBreadcrumb from 'components/ui/MBreadcrumb';
import MButton from 'components/ui/MButton';
import MSimpleTabs from 'components/ui/MSimpleTabs/MSimpleTabsRouted';
import EnvironmentsApi from 'apis/EnvironmentsApi';
import './PublishingView.scss';
import PublishingViewPublishModel from './PublishingViewPublishModel';
import initialState, { reducer } from './stateManagement';
import SelectBaseEnv from './SelectBaseEnv/SelectBaseEnv';
import SelectEntryPoint from './SelectEntryPoint/SelectEntryPoint';
import publishingActions from './publishingActions';
import InterludeView from './InterludeView';

const filesApi = new FilesApi();

export const UnconnectedPublishingView = (props) => {
  const {
    match: {
      params: { namespace, slug, path },
    },
    project,
    branches,
    history,
  } = props;

  const { gitlabId, id, pipelines } = project;
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

  const isFinalFormValid = mlCategory && model && areTermsAccepted;

  const hasPipelines = pipelines?.length > 0;

  useEffect(() => {
    filesApi.getFilesPerProject(
      gitlabId,
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

    EnvironmentsApi
      .getMany()
      .then((envs) => dispatch({ type: 'SET_LIST_OF_ENVS', payload: envs }))
      .catch((err) => toastr.error('Error', err.message));
  }, [gitlabId, selectedBranch, path, branches]);

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
                            <div className="parameter mb-3">
                              <span className="parameter-key">
                                Status to publish:
                              </span>
                              <strong className="parameter-value t-danger">
                                {model ? model.label : 'No model type'}
                              </strong>
                            </div>
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
                                    model_type: model.label,
                                    ml_category: mlCategory.label,
                                    accepted_publishing_terms: areTermsAccepted,
                                  },
                                  hasPipelines,
                                )
                                  .then(() => {
                                    toastr.success('Success', 'Your project will appear in the market place');
                                    history.push(`/${namespace}/${slug}/-/publishing/process`);
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
    }).isRequired,
  }).isRequired,
  project: PropTypes.shape({}).isRequired,
  branches: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })).isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

function mapStateToProps({ projects: { selectedProject }, branches }) {
  return {
    project: selectedProject,
    branches,
  };
}

export default connect(mapStateToProps)(UnconnectedPublishingView);
