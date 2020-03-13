import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Redirect } from 'react-router-dom';
import { toastr } from 'react-redux-toastr';
import Button from '@material-ui/core/Button';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import Navbar from '../navbar/navbar';
import './newProject.css';
import * as projectActions from '../../actions/projectInfoActions';
import projectGeneraInfoApi from '../../apis/projectGeneralInfoApi';

const publicIcon = 'https://gitlab.com/mlreef/frontend/uploads/b93c33fb581d154b037294ccef81dadf/global-01.png';
const privateIcon = 'https://gitlab.com/mlreef/frontend/uploads/83b8885be99f4176f1749924772411b3/lock-01.png';

const bannedCharacters = ['..', '~', '^', ':', '\\', '{', '}', '[', ']', '$', '#', '&', '%', '*', '+', '¨', '"', '!'];

class NewProject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibility: 'private',
      input: '',
      redirect: false,
      readme: false,
      user: '',
      description: '',
      newProject: {},
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleVisibility = (e) => {
    this.setState({ visibility: e.target.value });
  }

  handleProjectName = (e) => {
    this.setState({ input: e.target.value });
  }

  handleUser = (e) => {
    this.setState({ user: e.target.value });
  }

  checkReadme = (e) => {
    this.setState({ readme: !this.state.readme });
  }

  handleDescription = (e) => {
    this.setState({ description: e.target.value });
  }

  validateProjectName = (text) => {
    let bannedCharCount = 0;

    bannedCharacters.forEach((char) => {
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
      input,
      readme,
      description,
      visibility,
    } = this.state;

    const bannedName = this.validateProjectName(input);

    if (!bannedName) {
      toastr.error('Error:', 'Name can contain only letters, digits, "_", ".", dash, space. It must start with letter, digit or "_".');
      this.setState({ input: '' });
      return;
    }
    if (input === null || input === '') {
      toastr.error('Error:', 'Enter a valid project name');
      return;
    }

    projectGeneraInfoApi.create({
      name: input,
      initialize_with_readme: readme,
      description,
      visibility,
    })
      .then(async (res) => {
        if (res.ok) {
          const pro = await res.json();
          this.props.actions.getProjectsList();
          this.setState({ redirect: true, newProject: pro });
        }
      })
      .catch((err) => console.log(err));
  }

 cancelCreate = () => {
   this.props.history.push('/my-projects');
 }

 convertToSlug = (Text) => Text
   .toLowerCase()
   .replace(/ /g, '-')
   .replace(/[-]+/g, '-')
   .replace(/[^\w-]+/g, '');

 render() {
   const {
     visibility,
     input,
     redirect,
     readme,
     user,
     description,
     newProject,
   } = this.state;
   return redirect ? (
     <Redirect to={`/my-projects/${newProject && newProject.id}/master`} />
   ) : (
     <>
       <Navbar />
       <div className="main-div">
         <div className="proj-description">
           <span>New ML Project</span>
           <p>
A Machine Learning (ML) project is where you house your data set (repository),
where you perform data processing
(data pipeline), visualize your data set (data visualization) and where you create your experiments
           </p>
         </div>
         <div className="separator" />
         <div className="form-control">
           <form>
             <label className="label-name" htmlFor="projectTitle">
               <span className="heading">Project Name</span>
               <input
                 value={input}
                 onChange={this.handleProjectName}
                 className="text-input"
                 id="projectTitle"
                 type="text"
                 placeholder="My awesome ML Project"
                 required
               />
             </label>
             <div style={{ display: 'flex' }}>
               <label className="label-name" htmlFor="projectURL">
                 <span className="heading">Project URL</span>
                 <div style={{ display: 'flex', margin: '1em 0' }}>
                   <Tooltip arrow disableFocusListener disableTouchListener title="https://mlreef.com/">
                     <Button>https://mlreef.com/</Button>
                   </Tooltip>
                   <FormControl id="projectURL" variant="outlined">
                     <Select
                      labelId="demo-simple-select-outlined-label"
                      id="demo-simple-select-outlined"
                      value={user}
                      onChange={this.handleUser}
                    >
                      <MenuItem value="mlreef">mlreef</MenuItem>
                      <MenuItem value="SaathvikT">SaathvikT</MenuItem>
                    </Select>
                   </FormControl>
                 </div>
               </label>
               <label className="label-name" htmlFor="projectSlug" style={{ paddingLeft: '2em' }}>
                 <span className="heading">Project Slug</span>
                 <input
                   value={this.convertToSlug(input)}
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
             {/* Code for various data types to be included in later stages. Hint: Use an array of data-types */}
             <div style={{ marginTop: '1em' }}>
               <span className="heading">Visibilty level</span>
               <RadioGroup aria-label="visibility" name="visibility" value={visibility} onChange={this.handleVisibility}>
                 <FormControlLabel
                   className="heading"
                   value="private"
                   control={<Radio />}
                   label={(
                     <>
                      <img id="visibility-icon" src={privateIcon} alt="" />
                      <span>Private</span>
                    </>
                )}
                 />
                 <span className="visibility-msg">Project access must be granted explicitly to every user.</span>
                 <FormControlLabel
                   className="heading"
                   value="public"
                   control={<Radio />}
                   label={(
                     <>
                      <img id="visibility-icon" src={publicIcon} alt="" />
                      <span>Public</span>
                    </>
                )}
                 />
                 <span className="visibility-msg">The Project can be accessed without any authemtication.</span>
               </RadioGroup>
             </div>
             <div className="readME">
               <Checkbox
                 color="primary"
                 value={readme}
                 onChange={this.checkReadme}
                 inputProps={{
                   'aria-label': 'primary checkbox',
                 }}
               />
               <span className="heading">Initialize the Repository with a README</span>
               <p className="readme-msg">
Allows you to immediately clone this projects repository.
Skip this if you want to push up an existing repository
               </p>
             </div>
             <div className="form-controls">
               <button
                 type="reset"
                 className="cancel"
                 onClick={this.cancelCreate}
               >
                Cancel
               </button>
               <button
                 type="button"
                 className="create"
                 onClick={this.handleSubmit}
               >
                Create
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
    projects: state.projects,
    users: state.users,
    branches: state.branches.map((branch) => branch.name),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...projectActions,
    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NewProject);
