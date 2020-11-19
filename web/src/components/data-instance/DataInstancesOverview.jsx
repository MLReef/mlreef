import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import {
  shape, objectOf, string,
} from 'prop-types';
import { closeModal, fireModal } from 'actions/actionModalActions';
import { generateBreadCrumbs } from 'functions/helpers';
import { filterPipelinesOnStatus } from 'functions/pipeLinesHelpers';
import DataInstanceActions from 'components/data-instance/DataInstanceActions';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import './dataInstanceOverview.css';
import Instruction from '../instruction/instruction';
import { getTimeCreatedAgo, parseToCamelCase } from '../../functions/dataParserHelpers';
import { setPreconfiguredOPerations } from '../../actions/userActions';
import DataInstancesCard from './DataInstancesCard';

class DataInstanceOverview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      all: [],
      dataInstances: [],
    };

    this.fetchPipelines = this.fetchPipelines.bind(this);
  }

  componentDidMount() {
    this.fetchPipelines();
  }

  fetchPipelines() {
    const { projects: { selectedProject: { id, gitlabId } } } = this.props;

    DataInstanceActions.getDataInstances(id, gitlabId)
      .then((dataInstancesClassified) => this.setState({
        dataInstances: dataInstancesClassified,
        all: dataInstancesClassified,
      })).catch((err) => toastr.error('Error', err?.message));
  }

  render() {
    const {
      all,
      dataInstances,
    } = this.state;
    const {
      match: {
        params: { namespace, slug },
      },
      history,
      projects: { selectedProject },
      setPreconfiguredOPerations,
      fireModal,
      closeModal,
    } = this.props;

    const customCrumbs = [
      {
        name: 'Data',
        href: `/${namespace}/${slug}`,
      },
      {
        name: 'Datasets',
        href: `/${namespace}/${slug}/-/datasets`,
      },
    ];

    return (
      <>
        <div>
          <Navbar />
          <ProjectContainer
            activeFeature="data"
            breadcrumbs={generateBreadCrumbs(selectedProject, customCrumbs)}
          />
          <Instruction
            id="DataInstanceOverview"
            titleText="Handling datasets:"
            paragraph={
              `A dataset is the result of an executed data pipeline. You can use this dataset directly as your source of data for an experiment
               or to create another data pipeline. Simply select the dataset in the branch dropdown while selecting your data.`
            }
          />
          <div className="main-content">
            <div id="buttons-container" className="left">
              <button
                id="all"
                type="button"
                className="active btn btn-switch btn-bg-light btn-label-sm my-auto mr-2"
                onClick={(e) => this.setState({ dataInstances: filterPipelinesOnStatus(e, all) })}
              >
                All
              </button>
              <button
                id="InProgress"
                type="button"
                className="btn btn-switch btn-bg-light btn-label-sm my-auto mr-2"
                onClick={(e) => this.setState({ dataInstances: filterPipelinesOnStatus(e, all) })}
              >
                In Progress
              </button>
              <button
                id="Success"
                type="button"
                className="btn btn-switch btn-bg-light btn-label-sm my-auto mr-2"
                onClick={(e) => this.setState({ dataInstances: filterPipelinesOnStatus(e, all) })}
              >
                Success
              </button>
              <button
                id="Failed"
                type="button"
                className="btn btn-switch btn-bg-light btn-bg-lightbtn-label-sm my-auto mr-2"
                onClick={(e) => this.setState({ dataInstances: filterPipelinesOnStatus(e, all) })}
              >
                Failed
              </button>
              <button
                id="Canceled"
                type="button"
                className="btn btn-switch btn-bg-light btn-bg-lightbtn-label-sm my-auto mr-2"
                onClick={(e) => this.setState({ dataInstances: filterPipelinesOnStatus(e, all) })}
              >
                Canceled
              </button>
            </div>
            {dataInstances
              .map((dataInstanceClassification) => {
                const instances = dataInstanceClassification.values.map((val) => {
                  const timediff = getTimeCreatedAgo(val.commit.created_at, new Date());
                  const bpipeline = parseToCamelCase(val.backendPipeline);
                  return {
                    id: val.id,
                    pipelineBackendId: bpipeline.id,
                    currentState: val.status,
                    descTitle: val.name,
                    userName: val.commit.author_name,
                    commitId: val?.commit.id,
                    timeCreatedAgo: timediff,
                    projId: selectedProject.gid,
                    backendProjectId: selectedProject.id,
                    dataOperations: bpipeline.dataOperations,
                    backendInstanceId: bpipeline.dataInstanceId,
                    inputFiles: bpipeline.inputFiles,
                  };
                });
                const firstValue = dataInstanceClassification.values[0];
                const InstanceName = firstValue && firstValue.name;

                if (instances.length === 0) {
                  return null;
                }
                return (
                  <DataInstancesCard
                    key={InstanceName}
                    name={InstanceName}
                    namespace={namespace}
                    slug={slug}
                    history={history}
                    setPreconfiguredOPerations={setPreconfiguredOPerations}
                    params={{
                      currentState: dataInstanceClassification.status,
                      instances,
                    }}
                    fetchPipelines={this.fetchPipelines}
                    fireModal={fireModal}
                    closeModal={closeModal}
                  />
                );
              })}
          </div>
          <br />
          <br />
        </div>
      </>
    );
  }
}

DataInstanceOverview.propTypes = {
  match: shape({
    params: shape({
      namespace: string.isRequired,
      slug: string.isRequired,
    }).isRequired,
  }).isRequired,
  projects: shape({
    selectedProject: objectOf(shape).isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    projects: state.projects,
    branches: state.branches,
  };
}

function mapActionsToProps(dispatch) {
  return {
    setPreconfiguredOPerations: bindActionCreators(setPreconfiguredOPerations, dispatch),
    fireModal: bindActionCreators(fireModal, dispatch),
    closeModal: bindActionCreators(closeModal, dispatch),
  };
}

export default connect(mapStateToProps, mapActionsToProps)(DataInstanceOverview);
