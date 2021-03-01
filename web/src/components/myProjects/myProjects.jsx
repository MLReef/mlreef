import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { Helmet } from 'react-helmet';
import {
  arrayOf, shape, func, bool, string,
} from 'prop-types';
import MProjectClassification from 'components/ui/MProjectClassification/MProjectClassification';
import MTabs from 'components/ui/MTabs';
import {
  projectClassificationsProps,
} from 'dataTypes';
import { PROJECT_TYPES } from 'domain/project/projectTypes';
import MScrollableSection from 'components/ui/MScrollableSection/MScrollableSection';
import * as projectActions from 'store/actions/projectInfoActions';
import * as groupsActions from 'store/actions/groupsActions';
import * as userActions from 'store/actions/userActions';
import Navbar from '../navbar/navbar';
import './myProjects.scss';

const Myprojects = (props) => {
  const page = useRef(0);
  const isLastPage = useRef(false);

  const [allProjects, setAllProjects] = useState([]);
  const [scrolling, setScrolling] = useState(false);
  const [projectType, setProjectType] = useState(PROJECT_TYPES.DATA);
  const {
    actions: {
      getProcessorsPaginated,
      setPaginationInfoSuccessfully,
      setGlobalMarkerColor,
      getPaginatedProjectsByQuery,
      setProjectsInfoSuccessfully,
      setIsLoading,
    },
    allProjects: ap,
    isLoading,
    history,
    userInfo: { username },
    location: {
      hash,
    },
    paginationInfo,
  } = props;

  const fetchDataProjects = (localPage = 0) => {
    setIsLoading(true);

    let projectUrl = '/own';
    if (hash === '#explore') {
      projectUrl = '';
    }

    if (hash === '#starred') {
      projectUrl = '/starred';
    }

    getPaginatedProjectsByQuery(`${projectUrl}?page=${localPage}&size=${10}`, localPage === 0)
      .then(() => {
        setIsLoading(false);
        setScrolling(false);
      }).catch((err) => toastr.error('Error', err?.message));
  };

  const fetchCodeProjects = (localPage, codeProjectType = PROJECT_TYPES.VISUALIZATION) => {
    setIsLoading(true);
    let body = {};
    if (hash === '#personal') {
      body = {
        ...body,
        namespace: username,
      };
    } else if (hash === '#explore') {
      body = {
        ...body,
        visibility: 'PUBLIC',
      };
    } else if (hash === '#starred') {
      body = {
        ...body,
        min_stars: 1,
      };
    }

    getProcessorsPaginated(codeProjectType, body, localPage, 10)
      .then(() => {
        setIsLoading(false);
        setScrolling(false);
      })
      .catch((err) => toastr.error('Error', err.message));
  };

  const clickHandler = (id) => (ev) => {
    const node = ev.target;
    if (node.nodeName === 'BUTTON') {
      const { color } = projectClassificationsProps.filter((idsColor) => `${idsColor.classification}` === id)[0];
      setGlobalMarkerColor(color);
    }
  };

  const addEventListeners = () => projectClassificationsProps
    .map((obj) => obj.classification).forEach((id) => {
      document
        .getElementById(`tab-${id}`)
        .addEventListener('click', clickHandler(id));
    });

  const removeEventListeners = () => projectClassificationsProps
    .map((obj) => obj.classification).forEach((id) => {
      document.getElementById(`tab-${id}`).removeEventListener('click', clickHandler);
    });

  useEffect(() => {
    const { color } = projectClassificationsProps[0];
    setGlobalMarkerColor(color);

    addEventListeners();

    return () => {
      setPaginationInfoSuccessfully({});
      removeEventListeners();
    };
  }, []);

  useEffect(() => {
    if (projectType === PROJECT_TYPES.DATA) {
      fetchDataProjects(page.current);
    } else {
      fetchCodeProjects(page.current, projectType);
    }
  }, [hash]);

  useEffect(() => {
    setAllProjects(ap);
    isLastPage.current = paginationInfo?.last;
  }, [ap, paginationInfo]);

  const handleOnScrollEvent = useCallback(() => {
    if (isLastPage.current) return null;
    if (scrolling) return null;

    page.current += 1;
    setScrolling(true);
    if (projectType === PROJECT_TYPES.DATA) {
      fetchDataProjects(page.current);
    } else {
      fetchCodeProjects(page.current, projectType);
    }

    return null;
  }, [isLastPage.current, scrolling, page.current, projectType]);

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
          defaultActive
          id={projectClassificationsProps[0].classification}
          label="ML Projects"
          color={projectClassificationsProps[0].color}
          callback={() => {
            setProjectType(PROJECT_TYPES.DATA);
            cleanPreviousParams();
            fetchDataProjects(0);
          }}
        >
          <MScrollableSection handleOnScrollDown={handleOnScrollEvent}>
            <MProjectClassification
              classification={projectClassificationsProps[0].classification}
              history={history}
              allProjects={allProjects}
              isLoading={isLoading}
              setPage={setPage}
            />
          </MScrollableSection>
        </MTabs.Section>
        <MTabs.Section
          id={projectClassificationsProps[1].classification}
          label="Models"
          color={projectClassificationsProps[1].color}
          callback={() => {
            setProjectType(PROJECT_TYPES.ALGORITHM);
            cleanPreviousParams();
            fetchCodeProjects(0, PROJECT_TYPES.ALGORITHM);
          }}
        >
          <MScrollableSection handleOnScrollDown={handleOnScrollEvent}>
            <MProjectClassification
              classification={projectClassificationsProps[1].classification}
              history={history}
              allProjects={allProjects}
              isLoading={isLoading}
              setPage={setPage}
            />
          </MScrollableSection>
        </MTabs.Section>
        <MTabs.Section
          id={projectClassificationsProps[2].classification}
          label="Data Operations"
          color={projectClassificationsProps[2].color}
          callback={() => {
            setProjectType(PROJECT_TYPES.OPERATION);
            cleanPreviousParams();
            fetchCodeProjects(0, PROJECT_TYPES.OPERATION);
          }}
        >
          <MScrollableSection handleOnScrollDown={handleOnScrollEvent}>
            <MProjectClassification
              classification={projectClassificationsProps[2].classification}
              history={history}
              allProjects={allProjects}
              isLoading={isLoading}
              setPage={setPage}
            />
          </MScrollableSection>
        </MTabs.Section>
        <MTabs.Section
          id={projectClassificationsProps[3].classification}
          label="Data visualizations"
          color={projectClassificationsProps[3].color}
          callback={() => {
            setProjectType(PROJECT_TYPES.VISUALIZATION);
            cleanPreviousParams();
            fetchCodeProjects(0);
          }}
        >
          <MScrollableSection handleOnScrollDown={handleOnScrollEvent}>
            <MProjectClassification
              classification={projectClassificationsProps[3].classification}
              history={history}
              allProjects={allProjects}
              isLoading={isLoading}
              setPage={setPage}
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
    allProjects: state.projects.all,
    userProjects: state.projects.userProjects,
    starredProjects: state.projects.starredProjects,
    groups: state.groups,
    isLoading: state.globalMarker?.isLoading,
    userInfo: state.user.userInfo,
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
  allProjects: arrayOf(
    shape({}).isRequired,
  ).isRequired,
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
  userInfo: shape({ username: string }).isRequired,
  location: shape({
    hash: string.isRequired,
  }).isRequired,
  paginationInfo: shape({ last: bool }),
};

Myprojects.defaultProps = {
  paginationInfo: { last: true },
};

export default connect(mapStateToProps, mapDispatchToProps)(Myprojects);
