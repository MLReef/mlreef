import React, { Component } from 'react';
import { connect } from 'react-redux';
import { CircularProgress } from '@material-ui/core';
import './dataVisualizationOverview.css';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import Instruction from '../instruction/instruction';
import DataVisualizationCard from './dataVisualizationCard';
import {
  RUNNING,
  SUCCESS,
  EXPIRED,
} from '../../dataTypes';
import PipeLinesApi from '../../apis/PipelinesApi';
import { classifyPipeLines } from '../../functions/pipeLinesHelpers';

export class DataVisualizationOverview extends Component {
  constructor(props) {
    super(props);
    const { selectedProject, branches } = this.props;
    this.state = {
      filteredVisualizations: [],
    };
    const arrayOfBranches = branches.filter((branch) => branch.name.startsWith('data-visualization'));
    PipeLinesApi.getPipesByProjectId(selectedProject.id).then((res) => {
      const filteredVisualizations = classifyPipeLines(res, arrayOfBranches);
      this.setState({
        filteredVisualizations,
        all: filteredVisualizations,
      });
    });
    this.handleFilterBtnClick = this.handleFilterBtnClick.bind(this);
  }

  handleFilterBtnClick(idFilterButtonPressed) {
    let filteredIns = [];
    const { all } = this.state;
    switch (idFilterButtonPressed) {
      case 'all':
        filteredIns = all;
        break;
      case 'progress':
        filteredIns = all.filter((dataIns) => dataIns.status === RUNNING);
        break;
      case 'active':
        filteredIns = all.filter((dataIns) => dataIns.status === SUCCESS);
        break;
      default:
        filteredIns = all.filter((dataIns) => dataIns.status === EXPIRED);
        break;
    }
    this.setState({ filteredVisualizations: filteredIns });
  }

  render() {
    const {
      selectedProject,
    } = this.props;
    const { filteredVisualizations } = this.state;
    const groupName = selectedProject.namespace.name;
    return (
      <>
        <Navbar />
        <ProjectContainer
          project={selectedProject}
          activeFeature="data"
          folders={[groupName, selectedProject.name, 'Data', 'Visualizations']}
        />
        <Instruction
          titleText="Handling data visualizations:"
          paragraph={
            `A data visualization is the output of your data visualization pipeline. 
            By clicking on the name of your visualization, you will get access to the output files`
          }
        />
        <div className="main-content">
          <br />
          <div id="line" />
          <br />
          <div id="buttons-container">
            <button
              id="all"
              type="button"
              className="non-active-black-border rounded-pipeline-btn"
              onClick={(e) => this.handleFilterBtnClick(e.target.id)}
            >
              All
            </button>
            <button
              id="progress"
              type="button"
              className="non-active-black-border rounded-pipeline-btn"
              onClick={(e) => this.handleFilterBtnClick(e.target.id)}
            >
              In progress
            </button>
            <button
              id="active"
              type="button"
              className="non-active-black-border rounded-pipeline-btn"
              onClick={(e) => this.handleFilterBtnClick(e.target.id)}
            >
              Active
            </button>
            <button
              id="expired"
              type="button"
              className="non-active-black-border rounded-pipeline-btn"
              onClick={(e) => this.handleFilterBtnClick(e.target.id)}
            >
              Expired
            </button>
          </div>
          {filteredVisualizations.length === 0
            ? <div id="loading-circular-progress"><CircularProgress size={30} /></div>
            : filteredVisualizations.map((dataInsClas) => (
              <DataVisualizationCard classification={dataInsClas} key={dataInsClas.status} />
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

export default connect(mapStateToProps)(DataVisualizationOverview);
