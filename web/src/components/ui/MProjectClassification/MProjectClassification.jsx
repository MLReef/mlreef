import React, { Component, createRef } from 'react';
import {
  bool, shape, arrayOf, string,
} from 'prop-types';
import { CircularProgress } from '@material-ui/core';
import { Link } from 'react-router-dom';
import ArrowButton from 'components/arrow-button/arrowButton';
import ProjectSet from '../../projectSet';
import './MProjectClassification.scss';
import MCheckBox from '../MCheckBox/MCheckBox';

class MProjectClassification extends Component {
  projFilterBtnsList = ['own', 'starred', 'explore'];

  ownBtnRef = createRef();

  constructor(props) {
    super(props);
    this.state = {
      isDataTypesVisible: true,
    };
  }

  componentDidMount() {
    this.ownBtnRef.current.click();
  }

  // this change tabs in projectSet
  changeScreen = (screen) => {
    const {
      history: {
        push,
        location: {
          pathname,
        },
      },
    } = this.props;

    push(`${pathname}${screen}`);
  }

  handleClickDataTypesButton = () => this.setState(
    (prevState) => ({
      isDataTypesVisible: !prevState.isDataTypesVisible,
    }),
  );

  handleProjectFilterBtn(e, screen) {
    this.changeScreen(screen);
    const { classification } = this.props;
    this.projFilterBtnsList.forEach((btnId) => {
      document.getElementById(`${classification}-${btnId}-btn`).classList.replace('btn-basic-info', 'btn-basic-dark');
    });
    e.target.classList.replace('btn-basic-dark', 'btn-basic-info');
  }

  render() {
    const {
      isDataTypesVisible,
    } = this.state;

    const {
      classification,
      isFetching,
      userProjects,
      starredProjects,
      allProjects,
      history: {
        push,
        location: {
          hash: screen,
        },
      },
    } = this.props;
    const dataTypes = [
      { name: `${classification} data-types`, label: 'Text' },
      { name: `${classification} data-types`, label: 'Image' },
      { name: `${classification} data-types`, label: 'Audio' },
      { name: `${classification} data-types`, label: 'Video' },
      { name: `${classification} data-types`, label: 'Tabular' },
    ];
    return (
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div>
          <div id="buttons-div">
            <div id="filter-div">
              <button
                id={`${classification}-own-btn`}
                ref={this.ownBtnRef}
                onClick={(e) => this.handleProjectFilterBtn(e, '#personal')}
                type="button"
                className="btn btn-basic-dark"
              >
                My projects
              </button>
              <button
                id={`${classification}-starred-btn`}
                onClick={(e) => this.handleProjectFilterBtn(e, '#starred')}
                type="button"
                className="btn btn-basic-dark"
              >
                Starred
              </button>
              <button
                id={`${classification}-explore-btn`}
                onClick={(e) => this.handleProjectFilterBtn(e, '#explore')}
                type="button"
                className="btn btn-basic-dark"
              >
                Explore
              </button>
            </div>
            <div id="new-element-container" className="ml-auto">
              <Link
                to={`/new-project/classification/${classification}`}
                type="button"
                className="btn btn-primary"
              >
                New project
              </Link>
            </div>
          </div>
          {isFetching
            ? (
              <div className="project-content-loader">
                <CircularProgress size={40} />
              </div>
            )
            : (
              <div className="m-project-classification">
                <ProjectSet
                  push={push}
                  screen={screen || '#personal'}
                  changeScreen={this.changeScreen}
                  allProjects={allProjects}
                  personalProjects={userProjects}
                  starredProjects={starredProjects}
                />
                <div id="side-filters">
                  <div id="input-div">
                    <p>Refine by</p>
                    <button>Clear filters</button>
                  </div>
                  <br />
                  <div id="data-types-deploy-btn">
                    <p>
                      Data types
                    </p>
                    <ArrowButton callback={this.handleClickDataTypesButton} />
                  </div>
                  {isDataTypesVisible
                && (
                  dataTypes.map((dtype) => (
                    <MCheckBox
                      key={`${dtype.name} ${dtype.label} comp`}
                      name={dtype.name}
                      labelValue={dtype.label}
                      callback={(name, labelValue, newValue) => {

                      }}
                    />
                  ))
                )}
                </div>
              </div>
            )}
        </div>
      </div>
    );
  }
}

MProjectClassification.propTypes = {
  classification: string.isRequired,
  isFetching: bool.isRequired,
  userProjects: arrayOf(shape({})),
  starredProjects: arrayOf(shape({})),
  allProjects: arrayOf(shape({})),
};

MProjectClassification.defaultProps = {
  userProjects: [],
  starredProjects: [],
  allProjects: [],
};

export default MProjectClassification;
