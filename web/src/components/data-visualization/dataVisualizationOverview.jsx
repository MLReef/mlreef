import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  number, shape, string, arrayOf,
} from 'prop-types';
import MLoadingSpinner from 'components/ui/MLoadingSpinner';
import './dataVisualizationOverview.css';
import DataPipelineApi from 'apis/DataPipelineApi';
import { closeModal, fireModal } from 'actions/actionModalActions';
import { generateBreadCrumbs } from 'functions/helpers';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import Instruction from '../instruction/instruction';
import DataVisualizationCard from './dataVisualizationCard';
import GitlabPipelinesApi from '../../apis/GitlabPipelinesApi.ts';
import { classifyPipeLines, filterPipelinesOnStatus } from '../../functions/pipeLinesHelpers';

const dataPipelineApi = new DataPipelineApi();
const gitlabPipelinesApi = new GitlabPipelinesApi();

export class DataVisualizationOverview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visualizations: null,
      all: null,
    };
    this.fetchVisualizations = this.fetchVisualizations.bind(this);
  }

  componentDidMount() {
    this.fetchVisualizations();
  }

  componentWillUnmount() {
    this.setState((state) => state);
  }

  fetchVisualizations() {
    const { selectedProject, selectedProject: { id }, branches } = this.props;
    const arrayOfBranches = branches.filter((branch) => branch.name.startsWith('data-visualization'));
    dataPipelineApi.getProjectPipelines(id)
      .then((backendPipelines) => {
        const visualPipelines = backendPipelines.filter((pipe) => pipe.pipeline_type === 'VISUALIZATION');
        gitlabPipelinesApi.getPipesByProjectId(selectedProject.gid).then((res) => {
          const visualizations = classifyPipeLines(res, arrayOfBranches, visualPipelines);
          this.setState({
            visualizations,
            all: visualizations,
          });
        });
      });
  }

  render() {
    const {
      selectedProject: {
        gid,
      },
      selectedProject,
      match: {
        params: {
          namespace,
          slug,
        },
      },
    } = this.props;
    const {
      all,
      visualizations,
    } = this.state;

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
              onClick={(e) => this.setState({ visualizations: filterPipelinesOnStatus(e, all) })}
            >
              All
            </button>
            <button
              id="InProgress"
              type="button"
              className="btn btn-switch"
              onClick={(e) => this.setState({ visualizations: filterPipelinesOnStatus(e, all) })}
            >
              In progress
            </button>
            <button
              id="Success"
              type="button"
              className="btn btn-switch"
              onClick={(e) => this.setState({ visualizations: filterPipelinesOnStatus(e, all) })}
            >
              Success
            </button>
            <button
              id="Failed"
              type="button"
              className="btn btn-switch"
              onClick={(e) => this.setState({ visualizations: filterPipelinesOnStatus(e, all) })}
            >
              Failed
            </button>
            <button
              id="Canceled"
              type="button"
              className="btn btn-switch"
              onClick={(e) => this.setState({ visualizations: filterPipelinesOnStatus(e, all) })}
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
                  callback={this.fetchVisualizations}
                />
              ))}
        </div>
        <br />
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    selectedProject: state.projects.selectedProject,
    branches: state.branches,
  };
}

DataVisualizationOverview.propTypes = {
  selectedProject: shape({
    gid: number.isRequired,
    namespace: string.isRequired,
    name: string.isRequired,
  }).isRequired,
  match: shape({
    params: shape({
      namespace: string.isRequired,
      slug: string.isRequired,
    }).isRequired,
  }).isRequired,
  branches: arrayOf(shape({})).isRequired,
};

function mapActionsToProps(dispatch) {
  return {
    fireModal: bindActionCreators(fireModal, dispatch),
    closeModal: bindActionCreators(closeModal, dispatch),
  };
}

export default connect(mapStateToProps, mapActionsToProps)(DataVisualizationOverview);
