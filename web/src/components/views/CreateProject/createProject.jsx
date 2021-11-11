import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Redirect } from 'react-router-dom';
import * as PropTypes from 'prop-types';
import { toastr } from 'react-redux-toastr';
import {
  projectClassificationsProps,
  privacyLevelsArr,
  ML_PROJECT,
  DATA_OPERATION,
  DATA_VISUALIZATION,
  MODEL as BE_MODEL,
} from 'dataTypes';
import {
  PROJECT_DATA_TYPES,
} from 'domain/project/ProjectDataTypes';
import MInput from 'components/ui/MInput';
import MButton from 'components/ui/MButton';
import { validateProjectName } from 'functions/validations';
import { PROJECT_TYPES } from 'domain/project/projectTypes';
import * as projectActions from 'store/actions/projectInfoActions';
import * as userActions from 'store/actions/userActions';
import { getGroupsList } from 'store/actions/groupsActions';
import MRichRadioGroup from 'components/ui/MRichRadioGroup';
import MRichCheckButton from 'components/ui/MRichCheckButton';
import MImageUpload from 'components/ui/MImageUpload';
import { delay } from 'functions/helpers';
import Navbar from '../../navbar/navbar';
import './createProject.css';
import ProjectGeneraInfoApi from '../../../apis/ProjectGeneralInfoApi.ts';
import { convertToSlug } from '../../../functions/dataParserHelpers';
import MCheckBox from '../../ui/MCheckBox/MCheckBox';

const MAX_LENGTH = 255;
const projectGeneraInfoApi = new ProjectGeneraInfoApi();

const {
  IMAGE, TEXT, AUDIO, VIDEO, TABULAR, NUMBER, BINARY, MODEL, TIME_SERIES, HIERARCHICAL,
} = PROJECT_DATA_TYPES;

const processorTypes = [
  { name: BE_MODEL, dataProcessorType: 'ALGORITHM' },
  { name: DATA_OPERATION, dataProcessorType: 'OPERATION' },
  { name: DATA_VISUALIZATION, dataProcessorType: 'VISUALIZATION' },
];

class CreateProject extends Component {
  dataTypes = [
    [
      { name: 'data-types Text', label: TEXT },
      { name: 'data-types Image', label: IMAGE },
      { name: 'data-types Audio', label: AUDIO },
      { name: 'data-types Hierarchical', label: HIERARCHICAL },
    ],
    [
      { name: 'data-types Video', label: VIDEO },
      { name: 'data-types Tabular', label: TABULAR },
      { name: 'data-types Time_series', label: TIME_SERIES },
    ],
    [
      { name: 'data-types Number', label: NUMBER },
      { name: 'data-types Binary', label: BINARY },
      { name: 'data-types Model', label: MODEL },
    ],
  ];

  constructor(props) {
    super(props);

    this.state = {
      visibility: privacyLevelsArr[0].value,
      projectName: '',
      nameErrors: '',
      slug: '',
      redirect: null,
      readme: false,
      nameSpace: '',
      description: '',
      dataTypesSelected: [],
      isFetching: false,
      isWaiting: false,
      file: null,
    };

    this.handleDTCallback = this.handleDTCallback.bind(this);
  }

  componentDidMount() {
    const {
      actions,
      match: { params: { classification, groupNamespace } },
      user,
    } = this.props;

    const bandColor = projectClassificationsProps
      .filter((idsColor) => `${idsColor.classification}` === classification)[0].color;

    this.setState({ nameSpace: groupNamespace || user.username });

    actions.setGlobalMarkerColor(bandColor);
    actions.getGroupsList();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  static getDerivedStateFromProps(nextProps) {
    return {
      groups: nextProps.groups,
    };
  }

  handleVisibility = (visibility) => this.setState({ visibility });

  handleProjectName = (e) => {
    const projectName = e.target.value;

    const nameTooLong = projectName.length > MAX_LENGTH
      ? `Name is too long; Maximum is ${MAX_LENGTH} characters` : '';

    const dangerousName = validateProjectName(projectName)
      ? ''
      : 'Name can only contain letters, digits, "_", ".", dashes or spaces. It must start with a letter, digit or "_".';

    this.setState({
      projectName,
      slug: convertToSlug(projectName),
      nameErrors: nameTooLong || dangerousName,
    });
  }

  handleValidateName = () => {
    const { projectName } = this.state;

    if (projectName.length < 3) return;

    projectGeneraInfoApi.getSlugForValidName(projectName)
      .then((res) => {
        if (res.status === 409) {
          this.setState({ nameErrors: 'Conflicting: Project name is already used by you or in your teams' });
        }
        if (res.status === 451) {
          this.setState({ nameErrors: 'Forbidden: The name does not comply with our naming policy. Please see the User Docs' });
        }
        if (!res.ok) return Promise.reject(res);
        return res.status !== 204 ? res.json() : res;
      })
      .then((result) => {
        const nameTooLong = projectName.length > MAX_LENGTH
          ? `Name is too long; Maximum is ${MAX_LENGTH} characters` : '';
        const dangerousName = validateProjectName(projectName)
          ? ''
          : 'Name can only contain letters, digits, "_", ".", dashes or spaces. It must start with a letter, digit or "_".';
        this.setState({
          projectName,
          slug: result.slug,
          nameErrors: nameTooLong || dangerousName,
        });
      })
      .catch((err) => {
        toastr.error('Error', err || 'Something went wrong.');
      })
      .finally(() => {
        this.setState({ isFetching: false });
      });
  }

  handleNamespace = (e) => this.setState({ nameSpace: e.target.value })

  toggleCheckReadme = () => {
    const { readme } = this.state;
    this.setState({ readme: !readme });
  };

  handleDescription = (e) => {
    this.setState({ description: e.target.value });
  }

  handleSubmit = () => {
    const {
      projectName,
      slug,
      readme,
      description,
      visibility,
      nameSpace,
      dataTypesSelected,
      file,
    } = this.state;

    const {
      match: { params: { classification } },
      history,
    } = this.props;

    const projectType = classification && classification !== '' && classification !== ML_PROJECT
      ? PROJECT_TYPES.CODE_PROJ
      : PROJECT_TYPES.DATA_PROJ;

    let body = {
      name: projectName,
      slug,
      namespace: nameSpace,
      initialize_with_readme: readme,
      description,
      visibility,
      input_data_types: dataTypesSelected,
    };

    if (projectType === PROJECT_TYPES.CODE_PROJ) {
      body = {
        ...body,
        data_processor_type: processorTypes
          .filter((pt) => pt.name === classification)[0]
          .dataProcessorType,
      };
    }

    this.setState({ isFetching: true });

    projectGeneraInfoApi.create(body, projectType)
      .then((res) => {
        this.setState({ isWaiting: true });
        return res;
      })
      .then(delay(5000))
      .then((res) => file.name && projectGeneraInfoApi.createCover(res.id, file)
        .catch((err) => toastr.error('Error uploading the cover', err.message)))
      .then(() => history.push(`/${nameSpace}/${slug}`))
      .catch((err) => {
        toastr.error('Error', err.message);
        this.setState({ isFetching: false });
      });
  }

  cancelCreate = () => {
    const { history } = this.props;
    history.goBack();
  };

 getIsPrivacyOptionDisabled = (privacyLevel, nameSpace) => {
   const { user, groups } = this.props;

   if (!nameSpace && nameSpace === '') {
     return false;
   }
   const isNamespaceAGroup = nameSpace !== user.username;
   if (isNamespaceAGroup) {
     const currentGroup = groups.filter((grp) => grp.full_path === nameSpace)[0];
     const isAPrivateGroup = currentGroup.visibility === privacyLevelsArr[0].value;

     return isAPrivateGroup
       ? !(privacyLevel === privacyLevelsArr[0].value)
       : false;
   }

   return false;
 }

 handleDTCallback(...args) {
   const { dataTypesSelected: dts } = this.state;
   const isChecked = args[2];
   const dataType = args[1];

   if (isChecked) {
     if (!dts.includes(dataType) && dts.length < 4) {
       dts.push(dataType);
     }
   } else if (dts.includes(dataType)) {
     dts.splice(dts.indexOf(dataType), 1);
   }

   this.setState({ dataTypesSelected: dts });
 }

 render() {
   const {
     visibility,
     projectName,
     nameErrors,
     redirect,
     nameSpace,
     slug,
     description,
     dataTypesSelected: dtTypesSel,
     isFetching,
     isWaiting,
     readme,
   } = this.state;
   const { match: { params: { classification } }, groups, user } = this.props;
   const specificType = projectClassificationsProps
     .filter((classif) => classif.classification === classification)[0];
   const classLabel = specificType.label;
   const newProjectInstructions = specificType.description;
   const isMaximumOfDataTypesSelected = dtTypesSel.length === 4;
   const isValid = nameSpace && !nameErrors && projectName !== '' && dtTypesSel.length > 0;

   return redirect ? (
     <Redirect to={redirect} />
   ) : (
     <>
       <Navbar />
       <div className="new-project main-div row mt-4">
         <div className="proj-description col-sm-12 col-lg-3 pr-3 ">
           <span>
             New
             {' '}
             {classLabel}
           </span>
           <p>{newProjectInstructions}</p>
         </div>
         <div className="form-control col-sm-12 col-lg-7">
           <form>
             <label data-cy="projectName" className="label-name" htmlFor="projectTitle">
               <span className="heading mb-1">Project Name</span>
               <MInput
                 value={projectName}
                 onChange={this.handleProjectName}
                 onBlur={this.handleValidateName}
                 className="text-input"
                 id="projectTitle"
                 type="text"
                 error={nameErrors}
                 placeholder="My awesome ML Project"
                 cypressTag="project-name"
                 required
               />
             </label>

             <div className="create-project-url-container">
               <div className="form-field mb-4 flex-1 mr-4">
                 <label className="heading" htmlFor="nameSpace">
                   Project URL
                 </label>
                 <div className="form-field-prepend">
                   <div className="prepended bg-light">
                     <span className="m-auto">
                       https://mlreef.com/
                     </span>
                   </div>
                   <select
                     data-cy="namespace-select"
                     id="nameSpace"
                     value={nameSpace}
                     onChange={this.handleNamespace}
                     className="form-control w-100"
                   >
                     {groups.map((grp) => (
                       <option key={`namespace-${grp.id}`} value={grp.full_path}>
                         {grp.name}
                       </option>
                     ))}
                     <option key={`namespace-user-${user.id}`} className="my-3" value={user.username}>
                       {user.username}
                     </option>
                   </select>
                 </div>
               </div>

               <label className="mb-4" htmlFor="projectSlug">
                 <span className="heading">Project Slug</span>
                 <input
                   value={slug}
                   className="text-input mt-2"
                   id="projectSlug"
                   type="text"
                   placeholder="my-awesome-project"
                   required
                   readOnly
                 />
               </label>
             </div>

             {/* eslint-disable-next-line */}
            <div className="d-flex">
              <label className="label-name flex-1" htmlFor="projectDescription">
                <span className="heading">Project Description (optional)</span>
                <textarea
                  data-cy="description"
                  value={description}
                  className="proj-desc-textarea"
                  onChange={this.handleDescription}
                  id="projectDescription"
                  rows="5"
                  maxLength="250"
                  spellCheck="false"
                  placeholder="Enter your project description here..."
                />
              </label>
              <div className="ml-4">
                <span className="heading">Project image (optional)</span>
                <MImageUpload setImage={(file) => this.setState({ file })} />
              </div>
            </div>

             {/* ------ Data-types radio buttons ------ */}
            {/*  <label className="label-name mb-4" htmlFor="free-tags">
               <span className="heading mb-2">Free tags (optional)</span>
               <input
                 className="text-input"
                 id="free-tags"
                 type="text"
                 placeholder={'Enter free tags separated by ","'}
               />
             </label> */}
             <span className="heading d-block mb-2">Data types</span>
             <div className="my-2">
               <span
                 style={{ padding: 0, color: `var(--${isMaximumOfDataTypesSelected ? 'warning' : 'secondary'})` }}
                 className="visibility-msg"
               >
                 {
                  isMaximumOfDataTypesSelected
                    ? 'You already selected a maximum of 4 data types for this project.'
                    : 'Select maximum 4 data types your ML project will be based on.'
                 }
               </span>
             </div>
             <div className="data-types-container">
               {this.dataTypes.map((dtBl, index) => (
                 <div key={`dtBl ${index.toString()}`} className="data-types-sec">
                   {dtBl.map((dt) => {
                     if (dtTypesSel.length === 4 && !dtTypesSel.includes(dt.label)) {
                       return (
                         <div key={`div ${dt.name} disabled`}>
                           <p className="data-type-disabled">{dt.label}</p>
                         </div>
                       );
                     }
                     return (
                       <div className="pl-3" key={`div ${dt.name}`}>
                         <MCheckBox
                           cypressTag={dt.label}
                           key={dt.name}
                           name={dt.name}
                           labelValue={dt.label}
                           callback={this.handleDTCallback}
                           small
                         />
                       </div>
                     );
                   })}
                 </div>
               ))}
             </div>
             {/* eslint-disable-next-line */}
            <MRichRadioGroup
              radius
              title="Visibilty level"
              name="visibility"
              options={privacyLevelsArr
                .map((opt) => ({
                  ...opt,
                  disabled: this.getIsPrivacyOptionDisabled(opt.value, nameSpace),
                }))}
              value={visibility}
              onClick={this.handleVisibility}
            />
             {/* eslint-disable-next-line */}
            <MRichCheckButton
              name="read-me-checkbox"
              checked={readme}
              value="true"
              onClick={this.toggleCheckReadme}
              label="Initialize the repository with a README"
              subLabel="Allows you to immediately clone this projects repository. Skip this if you want to push up an existing repository"
            />
             <div className="form-controls mt-4">
               <button
                 type="button"
                 className="btn btn-basic-dark"
                 onClick={this.cancelCreate}
               >
                 Cancel
               </button>
               <MButton
                 cypressTag="create-btn"
                 disabled={!isValid}
                 className="btn btn-primary ml-auto"
                 waiting={isFetching || isWaiting}
                 onClick={this.handleSubmit}
               >
                 Create new
                 {' '}
                 {classLabel}
               </MButton>
             </div>
           </form>
         </div>
       </div>
     </>
   );
 }
}

function mapStateToProps(state) {
  return {
    groups: state.groups,
    user: state.user,
  };
}

function mapDispatchToProps(dispatch) {
  const groupActions = { getGroupsList };
  return {
    actions: bindActionCreators({
      ...projectActions,
      ...userActions,
      ...groupActions,
    }, dispatch),
  };
}

CreateProject.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  }).isRequired,
  groups: PropTypes.arrayOf(PropTypes.shape).isRequired,
  actions: PropTypes.shape({
    setGlobalMarkerColor: PropTypes.func.isRequired,
    getGroupsList: PropTypes.func.isRequired,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      classification: PropTypes.string,
      groupNamespace: PropTypes.string,
    }),
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
  }).isRequired,
};

CreateProject.defaultProps = {
  match: {
    params: {
      classification: 'ml-project',
      groupNamespace: undefined,
    },
  },
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateProject);
