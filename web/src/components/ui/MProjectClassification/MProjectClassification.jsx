import React, { useEffect, useState } from 'react';
import {
  string, bool, shape, func,
} from 'prop-types';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ArrowButton from 'components/arrow-button/arrowButton';
import * as projectActions from 'store/actions/projectInfoActions';
import * as userActions from 'store/actions/userActions';
import ProjectSet from '../../projectSet';
import './MProjectClassification.scss';
import MCheckBox from '../MCheckBox/MCheckBox';

const ALL = 'ALL';
const POPULAR = 'POPULAR';

const MProjectClassification = (props) => {
  const {
    classification,
    isLoading,
    history: {
      push,
      location: {
        pathname,
        hash,
      },
    },
    setPage,
    actions,
    dataTypes,
    onDataTypeSelected,
  } = props;

  const projFilterBtnsList = ['personal', 'starred', 'explore'];
  const [isDataTypesVisible, setIsDataTypesVisible] = useState(true);
  const [activeFilteringButton, setActiveFilteringButton] = useState('personal');

  const updateActiveButtons = () => {
    const buttonType = hash ? hash.substring(1, hash.length) : projFilterBtnsList[0];

    setActiveFilteringButton(buttonType);
  };

  useEffect(() => {
    updateActiveButtons();
  }, [hash]);

  const changeScreen = async (screen) => {
    actions.setIsLoading(true);
    push(`${pathname}${screen}`);
  };

  const handleFilterButtonClick = (screen) => async () => {
    setPage(0);
    changeScreen(screen);
    updateActiveButtons();
  };

  const handleSortBtnClicked = (sortingType) => () => actions.sortProjects(sortingType);

  return (
    <div className="d-flex" style={{ justifyContent: 'space-around' }}>
      <div className="flex-1 mx-4">
        <div className="scroll-styled" id="buttons-div">
          <div id="filter-div">
            <button
              onClick={handleFilterButtonClick('#personal')}
              type="button"
              className={`btn btn-basic-${activeFilteringButton === 'personal' ? 'info' : 'dark'}`}
            >
              My projects
            </button>
            <button
              onClick={handleFilterButtonClick('#starred')}
              type="button"
              className={`btn btn-basic-${activeFilteringButton === 'starred' ? 'info' : 'dark'}`}
            >
              Starred
            </button>
            <button
              onClick={handleFilterButtonClick('#explore')}
              type="button"
              className={`btn btn-basic-${activeFilteringButton === 'explore' ? 'info' : 'dark'}`}
            >
              Explore
            </button>
          </div>
          <div id="new-element-container" className="ml-auto">
            <Link
              to={`/new-project/classification/${classification}`}
              data-cy="project-create-btn"
              type="button"
              className="btn btn-primary"
            >
              {`New ${classification}`.replace('-', ' ')}
            </Link>
          </div>
        </div>
        <div className="m-project-classification">
          <ProjectSet
            isLoading={isLoading}
            classification={classification}
          />
          <div className="m-project-classification-filters d-none d-lg-block">
            <div id="input-div">
              <p>Refine by</p>
            </div>
            <div className="m-project-classification-filters-sort-btns">
              <button type="button" onClick={handleSortBtnClicked(ALL)}>All</button>
              <button type="button" onClick={handleSortBtnClicked(POPULAR)}>Popular</button>
            </div>
            <br />
            <div className="m-project-classification-filters-dtypes">
              <p>
                Data types
              </p>
              <ArrowButton callback={() => setIsDataTypesVisible(!isDataTypesVisible)} />
            </div>
            {isDataTypesVisible && (
              dataTypes.map((dtype) => (
                <MCheckBox
                  checked={dtype.checked}
                  key={`${dtype.name} ${dtype.label} comp`}
                  name={dtype.label}
                  labelValue={dtype.label}
                  callback={onDataTypeSelected}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

MProjectClassification.propTypes = {
  classification: string.isRequired,
  isLoading: bool,
  history: shape({
    push: func,
    location: shape({
      pathname: string,
      hash: string,
    }),
  }).isRequired,
  actions: shape({
    sortProjects: func,
  }).isRequired,
  setPage: func.isRequired,
};

MProjectClassification.defaultProps = {
  isLoading: false,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      getPaginatedProjectsByQuery: projectActions.getPaginatedProjectsByQuery,
      getProcessorsPaginated: projectActions.getProcessorsPaginated,
      sortProjects: projectActions.sortProjects,
      setIsLoading: userActions.setIsLoading,
    }, dispatch),
  };
}

export default connect(() => ({}), mapDispatchToProps)(MProjectClassification);
