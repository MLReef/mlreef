import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Redirect } from 'react-router-dom';
import { shape, string } from 'prop-types';
import { toastr } from 'react-redux-toastr';
import Button from '@material-ui/core/Button';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Tooltip from '@material-ui/core/Tooltip';
import {
  projectClassificationsProps,
  privacyLevelsArr,
} from 'dataTypes';
import Navbar from '../../navbar/navbar';
import './createProject.css';
import * as projectActions from '../../../actions/projectInfoActions';
import * as userActions from '../../../actions/userActions';
import ProjectGeneraInfoApi from '../../../apis/projectGeneralInfoApi.ts';
import { convertToSlug } from '../../../functions/dataParserHelpers';
import { bannedCharsArray } from '../../../dataTypes';
import MCheckBox from '../../ui/MCheckBox/MCheckBox';

class CreateProject extends Component {
  slugRef = createRef();

  dataTypes = [
    [
      { name: 'data-types Text', label: 'Text' },
      { name: 'data-types Image', label: 'Image' },
      { name: 'data-types Audio', label: 'Audio' },
    ],
    [
      { name: 'data-types Video', label: 'Video' },
      { name: 'data-types Tabular', label: 'Tabular' },
      { name: 'data-types Sensor', label: 'Sensor' },
    ],
    [
      { name: 'data-types Number', label: 'Number' },
      { name: 'data-types Binary', label: 'Binary' },
      { name: 'data-types Model', label: 'Model' },
    ],
  ];

  constructor(props) {
    super(props);
    this.state = {
      visibility: privacyLevelsArr[0].value,
      projectName: '',
      redirect: false,
      readme: false,
      nameSpace: '',
      description: '',
      gitlabId: null,
      dataTypesSelected: [],
    };
    const { actions, match: { params: { classification } } } = this.props;
    const bandColor = projectClassificationsProps.filter((idsColor) => `${idsColor.classification}` === classification)[0].color;
    actions.setGlobalMarkerColor(bandColor);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleVisibility = (e) => {
    this.setState({ visibility: e.target.value });
  }

  handleProjectName = (e) => {
    this.setState({ projectName: e.target.value });
  }

  handleNamespace = (e) => {
    this.setState({ nameSpace: e.target.value });
  }

  checkReadme = () => {
    this.setState({ readme: !this.state.readme });
  }

  handleDescription = (e) => {
    this.setState({ description: e.target.value });
  }

  validateProjectName = (text) => {
    let bannedCharCount = 0;

    bannedCharsArray.forEach((char) => {
      if (text.startsWith(char) || text.startsWith('.') || text.startsWith('-') || text.startsWith(' ')) {
        return false;
      }
      if (text.includes(char)) {
        bannedCharCount += 1;
      }
    });

    return bannedCharCount === 0;
  }

  handleSubmit = () => {
    const {
      projectName,
      readme,
      description,
      visibility,
      nameSpace,
    } = this.state;

    const isAValidName = this.validateProjectName(projectName);

    if (!isAValidName) {
      toastr.error('Error:', 'Name can contain only letters, digits, "_", ".", dash, space. It must start with letter, digit or "_".');
      this.setState({ projectName: '' });
      return;
    }
    if (projectName === null || projectName === '') {
      toastr.error('Error:', 'Enter a valid project name');
      return;
    }
    const slug = this.slugRef.current.value;
    const body = {
      name: projectName,
      slug,
      namespace: nameSpace,
      initialize_with_readme: readme,
      description,
      visibility,
    };
    const projectGeneraInfoApi = new ProjectGeneraInfoApi();
    projectGeneraInfoApi.create(body)
      .then((res) => res.json())
      .then((pro) => {
        this.props.actions
          .getProjectsList()
          .then(() => this.setState({ redirect: true, gitlabId: pro.gitlab_id }))
      })
      .catch((err) => {
        console.log(err);
        toastr.error('Error', err || 'Something went wrong')
      });
  }

 cancelCreate = () => {
   this.props.history.push('/my-projects');
 }

 getIsPrivacyOptionDisabled = (privacyLevel, nameSpace) => {
   const { user, groups } = this.props;
   if (nameSpace === '') {
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

 render() {
   const {
     visibility,
     projectName,
     redirect,
     nameSpace,
     description,
     gitlabId,
     dataTypesSelected: dtTypesSel,
   } = this.state;
   const { match: { params: { classification } }, groups, user } = this.props;
   const classLabel = projectClassificationsProps.filter(
     (classif) => classif.classification === classification,
   )[0].label;
   const isMaximumOfDataTypesSelected = dtTypesSel.length === 4;
   return redirect ? (
     <Redirect to={`/my-projects/${gitlabId}/null`} />
   ) : (
     <>
       <Navbar />
       <div className="new-project main-div row mt-4">
         <div className="proj-description col-sm-12 col-lg-4 pr-3 ">
           <span>
             New
             {' '}
             {classLabel}
           </span>
           <p>
             A Machine Learning (ML) project is where you house your data set (repository),
             where you perform data processing
             (data pipeline), visualize your data set (data visualization)
             and where you create your experiments
           </p>
         </div>
         <div className="form-control col-sm-12 col-lg-8 pl-3">
           <form>
             <label className="label-name" htmlFor="projectTitle">
               <span className="heading">Project Name</span>
               <input
                 value={projectName}
                 onChange={this.handleProjectName}
                 className="text-input"
                 id="projectTitle"
                 type="text"
                 placeholder="My awesome ML Project"
                 required
               />
             </label>
             <div style={{ display: 'flex', flexWrap: 'wrap' }}>
               <label className="label-name pr-4" htmlFor="projectURL">
                 <span className="heading">Project URL</span>
                 <div style={{ display: 'flex', margin: '1em 0' }}>
                   <Tooltip arrow disableFocusListener disableTouchListener title="https://mlreef.com/">
                     <Button>https://mlreef.com/</Button>
                   </Tooltip>
                   <FormControl id="projectURL" variant="outlined">
                     <Select
                       labelId="nameSpace-label"
                       id="nameSpace"
                       value={nameSpace}
                       onChange={this.handleNamespace}
                     >
                       <MenuItem key="subtitle-1" value="">Groups</MenuItem>
                       {groups.map((grp) => (
                         <MenuItem key={`group kay ${grp.id}`} value={grp.full_path}>{grp.name}</MenuItem>
                       ))}
                       <MenuItem key="subtitle-2" value="">Users</MenuItem>
                       <MenuItem key={`user key ${user.id}`} value={user.username}>{user.username}</MenuItem>

                     </Select>
                   </FormControl>
                 </div>
               </label>
               <label className="label-name flex-1" htmlFor="projectSlug">
                 <span className="heading">Project Slug</span>
                 <input
                   ref={this.slugRef}
                   value={convertToSlug(projectName)}
                   className="text-input"
                   id="projectSlug"
                   type="text"
                   placeholder="my-awesome-project"
                   required
                   readOnly
                 />
               </label>
             </div>
             <label className="label-name" htmlFor="projectDescription">
               <span className="heading">Project Description (optional)</span>
               <textarea
                 value={description}
                 className="area-focus"
                 onChange={this.handleDescription}
                 id="projectDescription"
                 rows="4"
                 maxLength="250"
                 spellCheck="false"
                 placeholder="Description Format"
               />
             </label>
             {/* ------ Data-types radio buttons ------ */}
             <label className="label-name" htmlFor="free-tags">
               <span className="heading">Free tags (optional)</span>
               <input
                 className="text-input"
                 id="free-tags"
                 type="text"
                 placeholder={'Enter free tags separated by ","'}
               />
             </label>
             <span className="heading">Data types</span>
             <br />
             <br />
             <div>
               <span
                 style={{ padding: 0, color: `var(--${isMaximumOfDataTypesSelected ? 'warning' : 'secondary'})` }}
                 className="visibility-msg"
               >
                 {
                  isMaximumOfDataTypesSelected
                    ? 'You already selected a maximum of 4 data types for this project'
                    : 'Select maximum 4 data types your ML project will be based on'
                 }
               </span>
             </div>
             <br />
             <div className="d-flex">
               {this.dataTypes.map((dtBl, index) => (
                 <div key={`dtBl ${index.toString()}`} className="data-types-sec">
                   {dtBl.map((dt) => {
                     if (dtTypesSel.length === 4 && !dtTypesSel.includes(dt.label)) {
                       return <div key={`div ${dt.name} disabled`}><p className="data-type-disabled">{dt.label}</p></div>;
                     }
                     return (
                       <div key={`div ${dt.name}`}>
                         <MCheckBox
                           key={dt.name}
                           name={dt.name}
                           labelValue={dt.label}
                           callback={(...args) => {
                             const isChecked = args[2];
                             const dtType = args[1];
                             if (isChecked) {
                               if (
                                 !dtTypesSel.includes(dtType)
                                   && dtTypesSel.length < 4
                               ) {
                                 dtTypesSel.push(dtType);
                               }
                             } else if (
                               dtTypesSel.includes(dtType)
                             ) dtTypesSel.splice(dtTypesSel.indexOf(dtType), 1);
                             this.setState({ dataTypesSelected: dtTypesSel });
                           }}
                         />
                       </div>
                     );
                   })}
                 </div>
               ))}
             </div>
             {/* ------ ------ ------ ------ ------ --- */}
             <div style={{ marginTop: '1em' }}>
               <span className="heading">Visibilty level</span>
               <RadioGroup aria-label="visibility" name="visibility" value={visibility} onChange={this.handleVisibility}>
                 {privacyLevelsArr.map((lvl) => (
                   <div key={`privacy lvl ${lvl.value}`} className="d-flex" style={{ flexDirection: 'column' }}>
                     <FormControlLabel
                       className="heading"
                       value={lvl.value}
                       control={<Radio disabled={this.getIsPrivacyOptionDisabled(lvl.value, nameSpace)} />}
                       label={(
                         <>
                           <img id="visibility-icon" src={lvl.icon} alt="" />
                           <span>{lvl.name}</span>
                         </>
                        )}
                     />
                     <span key={`privacy lvl mss ${lvl.value}`} className="visibility-msg">{lvl.message.replace('#protected-element', 'project')}</span>
                   </div>
                 ))}
               </RadioGroup>
             </div>
             <div className="readME">
               <MCheckBox
                 name="read-me-checkbox"
                 labelValue="Initialize the Repository with a README"
                 callback={(...args) => this.setState({ readme: args[2] })}
               />
               <p className="readme-msg">
                 Allows you to immediately clone this projects repository.
                 Skip this if you want to push up an existing repository
               </p>
             </div>
             <div className="form-controls mt-4">
               <button
                 type="button"
                 className="btn btn-basic-dark"
                 onClick={this.cancelCreate}
               >
                 Cancel
               </button>
               <button
                 type="button"
                 className="btn btn-primary ml-auto"
                 onClick={this.handleSubmit}
               >
                 Create new
                 {' '}
                 {classLabel}
               </button>
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
  return {
    actions: bindActionCreators({
      ...projectActions,
      ...userActions,
    }, dispatch),
  };
}

CreateProject.propTypes = {
  match: shape({
    params: shape({
      classification: string,
    }),
  }),
};

CreateProject.defaultProps = {
  match: {
    params: {
      classification: 'ml-project',
    },
  },
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateProject);
