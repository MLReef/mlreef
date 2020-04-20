import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  number, arrayOf, string, shape, func,
} from 'prop-types';
import { Redirect } from 'react-router-dom';
import { toastr } from 'react-redux-toastr';
import {
  makeStyles,
} from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import ProjectContainer from './projectContainer';
import Navbar from './navbar/navbar';
import branchesApi from '../apis/BranchesApi';
import BorderedInput from './BlueBorderedInput';
import CustomizedSelect from './CustomizedSelect';

const cuztomizedStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: 120,
    width: '100%',
  },
}));

const TextFieldFromControl = ({ id, labelTxt, onChangeHandler }) => (
  <FormControl required variant="outlined" className={cuztomizedStyles().formControl}>
    <InputLabel id={`label-for-${id}`} style={{ backgroundColor: 'white', color: '#1A2B3F' }}>
      {labelTxt}
    </InputLabel>
    <BorderedInput id={id} onChange={(e) => { onChangeHandler(e); }} />
  </FormControl>
);

TextFieldFromControl.propTypes = {
  id: string.isRequired,
  labelTxt: string.isRequired,
  onChangeHandler: func.isRequired,
};

const bannedCharacters = [' ', '..', '~', '^', ':', '\\', '{', '}', '[', ']', '$', '#', '&', '%', '*', '+', '¨', '"', '!'];

class NewBranch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      branchSelected: null,
      newBranchName: '',
      redirect: false,
      loading: false,
    };
    this.handleCreateBranchEv = this.handleCreateBranchEv.bind(this);
  }

  setBranchSelected = (branchSelected) => this.setState(() => ({
    branchSelected,
  }));

  validateBranchName = (branchName) => {
    if (!branchName.length > 0) {
      return false;
    }

    if (branchName.startsWith('-')) {
      return false;
    }
    let bannedCharCount = 0;
    bannedCharacters.forEach((char) => {
      if (branchName.includes(char)) {
        bannedCharCount += 1;
      }
    });

    return bannedCharCount === 0;
  }

  handleCancel = (e) => {
    const {
      history
    } = this.props;

    return history.goBack();
  }

  handleCreateBranchEv() {
    this.setState({ loading: true });
    const {
      projects: {
        selectedProject: { id },
      },
    } = this.props;
    const {
      branchSelected,
      newBranchName,
    } = this.state;

    if (branchSelected === null || branchSelected === '') {
      toastr.error('Error:', 'Select please a branch from options');
      return;
    }

    if (newBranchName === null || newBranchName === '') {
      toastr.error('Error:', 'Type please a branch name');
      return;
    }

    branchesApi.create(
      id,
      newBranchName,
      branchSelected,
    )
      .then(() => {
        this.setState({ redirect: true, loading: false });
        toastr.success('Success:', 'The branch was created');
      })
      .catch(
        () => {
          this.setState({ loading: false });
          toastr.error('Error:', 'An error has ocurred, try later please');
        },
      );
  }

  render() {
    const { projects: { selectedProject }, branches } = this.props;
    const groupName = selectedProject.namespace.name;
    const {
      branchSelected,
      newBranchName,
      redirect,
      // loading,
    } = this.state;

    const isValidBranchName = this.validateBranchName(newBranchName);
    const isEnabledCreateBranchButton = ((branchSelected !== null && branchSelected !== '') && isValidBranchName);

    return redirect ? (
      <Redirect to={`/my-projects/${selectedProject.id}/${encodeURIComponent(newBranchName)}`} />
    ) : (
      <>
        <Navbar />
        <ProjectContainer
          activeFeature="data"
          folders={[groupName, selectedProject.name, 'Data', 'New branch']}
        />
        <div className="main-content">
          <br />
          <div style={{ margin: '1%' }}>
            <h6 className="t-dark">
              New branch
            </h6>
          </div>
          <br />
          <div style={{ width: '74%', marginLeft: '5vw', marginBottom: '2vw' }}>
            <TextFieldFromControl
              id="new-branch-name"
              labelTxt="Branch name"
              onChangeHandler={(e) => this.setState({ newBranchName: e.target.value })}
            />
          </div>
          <div style={{ width: '74%', marginLeft: '5vw', marginBottom: '2vw' }}>
            <CustomizedSelect
              options={branches}
              inputId="branches-select"
              onChangeHandler={this.setBranchSelected}
              inputLabelText="Create from"
            />
          </div>
          <div style={{
            display: 'flex',
            backgroundColor: '#F9F8F8',
            padding: '1em 2em',
            justifyContent: 'space-between',
          }}
          >
            <button
              className="btn btn-basic-dark"
              onClick={this.handleCancel}
              href={`/my-projects/${selectedProject.id}/master`}
            >
              Cancel
            </button>

            <button
              id="create-branch-btn"
              type="button"
              onClick={this.handleCreateBranchEv}
              disabled={!isEnabledCreateBranchButton}
              className="btn btn-primary"
            >
              Create Branch
            </button>
          </div>
        </div>
      </>
    );
  }
}

const project = shape({
  id: number,
  name: string,
});

NewBranch.propTypes = {
  projects: shape({
    all: arrayOf(project),
    selectedProject: project,
  }).isRequired,
  branches: arrayOf(string).isRequired,
};

function mapStateToProps(state) {
  return {
    projects: state.projects,
    branches: state.branches.map((branch) => branch.name),
  };
}

export default connect(mapStateToProps)(NewBranch);
