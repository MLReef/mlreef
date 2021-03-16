import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { Helmet } from 'react-helmet';
import {
  shape, func, bool, string,
} from 'prop-types';
import MProjectClassification from 'components/ui/MProjectClassification/MProjectClassification';
import MTabs from 'components/ui/MTabs';
import {
  ML_PROJECT,
  projectClassificationsProps,
} from 'dataTypes';
import { PROJECT_DATA_TYPES } from 'domain/project/ProjectDataTypes';
import MScrollableSection from 'components/ui/MScrollableSection/MScrollableSection';
import * as projectActions from 'store/actions/projectInfoActions';
import * as groupsActions from 'store/actions/groupsActions';
import * as userActions from 'store/actions/userActions';
import Navbar from '../navbar/navbar';
import './myProjects.scss';

const {
  IMAGE, TEXT, AUDIO, VIDEO, TABULAR, NUMBER, BINARY, MODEL, TIME_SERIES, HIERARCHICAL,
} = PROJECT_DATA_TYPES;

const Myprojects = (props) => {
  const page = useRef(0);
  const [scrolling, setScrolling] = useState(false);
  const {
    actions: {
      getProcessorsPaginated,
      setPaginationInfoSuccessfully,
      setGlobalMarkerColor,
      getPaginatedProjectsByQuery,
      setProjectsInfoSuccessfully,
      setIsLoading,
    },
    isLoading,
    history,
    location: {
      hash,
    },
    paginationInfo: { last },
    match: {
      params: {
        classification,
      },
      path,
    },
  } = props;

  const [dataTypes, setDataTypes] = useState([
    { label: TEXT, checked: false },
    { label: IMAGE, checked: false },
    { label: AUDIO, checked: false },
    { label: HIERARCHICAL, checked: false },
    { label: VIDEO, checked: false },
    { label: TABULAR, checked: false },
    { label: TIME_SERIES, checked: false },
    { label: NUMBER, checked: false },
    { label: BINARY, checked: false },
    { label: MODEL, checked: false },
  ]);

  const getMappedDataTypes = (dTypes) => dTypes
    .filter((dt) => dt.checked === true).map((dt) => dt.label);

  const classificationToFilter = classification || 'ml-project';

  /* const isLastPage = useRef(last); */

  const fetchDataProjects = (localPage = 0) => {
    setIsLoading(true);

    getPaginatedProjectsByQuery(
      projectActions.buildProjectsRequestBody(hash, getMappedDataTypes(dataTypes)), localPage, 30
    )
      .then(() => {
        setIsLoading(false);
        setScrolling(false);
      }).catch((err) => toastr.error('Error', err?.message));
  };

  const fetchCodeProjects = (
    localPage,
    codeProjectType,
  ) => {
    setIsLoading(true);

    getProcessorsPaginated(
      codeProjectType,
      projectActions.buildProjectsRequestBody(hash, getMappedDataTypes(dataTypes)),
      localPage,
      30,
    )
      .then(() => {
        setIsLoading(false);
        setScrolling(false);
      })
      .catch((err) => toastr.error('Error', err.message));
  };

  const onDataTypeSelected = (...args) => {
    const { typeOfProcessor } = projectClassificationsProps
      .filter((pc) => pc.classification === classification)[0];
    const newDatatypes = [
      ...dataTypes.map((dt) => dt.label === args[1] ? { ...dt, checked: args[2] } : dt),
    ];
    const datatypesforRequest = getMappedDataTypes(newDatatypes);
    if (typeOfProcessor) {
      getProcessorsPaginated(
        typeOfProcessor,
        projectActions.buildProjectsRequestBody(
          hash,
          datatypesforRequest,
        ), 0, 30,
      ).catch((err) => err);
    } else {
      getPaginatedProjectsByQuery(
        projectActions.buildProjectsRequestBody(
          hash,
          datatypesforRequest,
        ), 0, 30,
      ).catch((err) => err);
    }
    page.current = 0;
    setDataTypes(newDatatypes);
  };

  useEffect(() => {
    if (path === '/') {
      history.push('/dashboard/ml-project');
    }
    const { color } = projectClassificationsProps
      .filter((pc) => pc.classification === classificationToFilter)[0];
    setGlobalMarkerColor(color);

    return () => {
      setPaginationInfoSuccessfully({});
    };
  }, []);

  useEffect(() => {
    const { typeOfProcessor } = projectClassificationsProps
      .filter((pj) => pj.classification === classificationToFilter)[0];
    if (classificationToFilter === ML_PROJECT) {
      fetchDataProjects(page.current);
    } else {
      fetchCodeProjects(page.current, typeOfProcessor);
    }
  }, [hash, classificationToFilter]);

  const handleOnScrollEvent = useCallback(() => {

    /* if (isLastPage.current) return null;
    if (scrolling) return null;

    page.current += 1;
    isLastPage.current = last;
    setScrolling(true);
    if (classification === PROJECT_TYPES.DATA) {
      fetchDataProjects(page.current);
    } else {
      fetchCodeProjects(page.current, classification);
    }

    return null; */
  }, [last, scrolling, page.current, classification]);

  const cleanPreviousParams = () => {
    page.current = 0;
    setProjectsInfoSuccessfully([]);
    setIsLoading(true);
  };

  const setPage = useCallback((p) => { page.current = p; }, []);

  return (
    <div style={{ backgroundColor: '#f2f2f2' }}>
      <Helmet>
        <title>
          Dashboard · MLReef
        </title>
      </Helmet>
      <Navbar />
      <br />
      <br />
      <br />
      <MTabs>
        <MTabs.Section
          defaultActive={classification === projectClassificationsProps[0].classification}
          id={projectClassificationsProps[0].classification}
          label="ML Projects"
          color={projectClassificationsProps[0].color}
          callback={() => {
            history.push(`/dashboard/${projectClassificationsProps[0].classification}${hash}`);
            setGlobalMarkerColor(projectClassificationsProps[0].color);
            cleanPreviousParams();
          }}
        >
          <MScrollableSection handleOnScrollDown={handleOnScrollEvent}>
            <MProjectClassification
              classification={projectClassificationsProps[0].classification}
              history={history}
              isLoading={isLoading}
              setPage={setPage}
              dataTypes={dataTypes}
              onDataTypeSelected={onDataTypeSelected}
            />
          </MScrollableSection>
        </MTabs.Section>
        <MTabs.Section
          id={projectClassificationsProps[1].classification}
          defaultActive={classification === projectClassificationsProps[1].classification}
          label="Models"
          color={projectClassificationsProps[1].color}
          callback={() => {
            history.push(`/dashboard/${projectClassificationsProps[1].classification}${hash}`);
            setGlobalMarkerColor(projectClassificationsProps[1].color);
            cleanPreviousParams();
          }}
        >
          <MScrollableSection handleOnScrollDown={handleOnScrollEvent}>
            <MProjectClassification
              classification={projectClassificationsProps[1].classification}
              history={history}
              isLoading={isLoading}
              setPage={setPage}
              dataTypes={dataTypes}
              onDataTypeSelected={onDataTypeSelected}
            />
          </MScrollableSection>
        </MTabs.Section>
        <MTabs.Section
          id={projectClassificationsProps[2].classification}
          defaultActive={classification === projectClassificationsProps[2].classification}
          label="Data Operations"
          color={projectClassificationsProps[2].color}
          callback={() => {
            history.push(`/dashboard/${projectClassificationsProps[2].classification}${hash}`);
            setGlobalMarkerColor(projectClassificationsProps[2].color);
            cleanPreviousParams();
          }}
        >
          <MScrollableSection handleOnScrollDown={handleOnScrollEvent}>
            <MProjectClassification
              classification={projectClassificationsProps[2].classification}
              history={history}
              isLoading={isLoading}
              setPage={setPage}
              dataTypes={dataTypes}
              onDataTypeSelected={onDataTypeSelected}
            />
          </MScrollableSection>
        </MTabs.Section>
        <MTabs.Section
          id={projectClassificationsProps[3].classification}
          defaultActive={classification === projectClassificationsProps[3].classification}
          label="Data visualizations"
          color={projectClassificationsProps[3].color}
          callback={() => {
            history.push(`/dashboard/${projectClassificationsProps[3].classification}${hash}`);
            setGlobalMarkerColor(projectClassificationsProps[3].color);
            cleanPreviousParams();
          }}
        >
          <MScrollableSection handleOnScrollDown={handleOnScrollEvent}>
            <MProjectClassification
              classification={projectClassificationsProps[3].classification}
              history={history}
              isLoading={isLoading}
              setPage={setPage}
              dataTypes={dataTypes}
              onDataTypeSelected={onDataTypeSelected}
            />
          </MScrollableSection>
        </MTabs.Section>
      </MTabs>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    paginationInfo: state.projects.paginationInfo,
    sorting: state.projects.sorting,
    allProjects: state.projects.all,
    isLoading: state.globalMarker?.isLoading,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...projectActions,
      ...groupsActions,
      ...userActions,
    }, dispatch),
  };
}

Myprojects.propTypes = {
  isLoading: bool.isRequired,
  actions: shape({
    getProjectsList: func.isRequired,
    getProcessorsPaginated: func.isRequired,
    setPaginationInfoSuccessfully: func.isRequired,
    setGlobalMarkerColor: func.isRequired,
    getPaginatedProjectsByQuery: func.isRequired,
    setProjectsInfoSuccessfully: func.isRequired,
    setIsLoading: func.isRequired,
  }).isRequired,
  history: shape({ push: func }).isRequired,
  location: shape({
    hash: string.isRequired,
  }).isRequired,
  match: shape({
    params: shape({
      classification: string,
    }),
    path: string,
  }).isRequired,
  paginationInfo: shape({ last: bool }),
};

Myprojects.defaultProps = {
  paginationInfo: { last: true },
};

export default connect(mapStateToProps, mapDispatchToProps)(Myprojects);
