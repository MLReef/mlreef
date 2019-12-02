import React, { Component, useState } from 'react';
import { connect } from 'react-redux';
import {
  number, arrayOf, string, shape, func, bool,
} from 'prop-types';
import { Redirect } from 'react-router-dom';
import { toastr } from 'react-redux-toastr';
import {
  makeStyles, withStyles,
} from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import {
  Button,
  Typography,
  CircularProgress,
} from '@material-ui/core';
import InputBase from '@material-ui/core/InputBase';
import Select from '@material-ui/core/Select';
import ProjectContainer from './projectContainer';
import Navbar from './navbar/navbar';
import branchesApi from '../apis/BranchesApi';

const BorderedInput = withStyles((theme) => ({
  root: {
    'label + &': {
      backgroundColor: 'white',
    },
  },
  input: {
    borderRadius: 4,
    backgroundColor: theme.palette.background.paper,
    border: '1px solid #ced4da',
    padding: '18px 19px',
    '&:focus': {
      borderRadius: 4,
      boxShadow: '0 0 0 0.1rem rgb(50, 175, 195)',
    },
  },
}))(InputBase);

const cuztomizedStyles = makeStyles((theme) => ({
  formControl: {
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(10),
    minWidth: 120,
    width: '80%',
  },
  loadingDiv: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  buttonProgress: {
    color: '#15b785',
    position: 'absolute',
    top: '45%',
    left: '45%',
    marginTop: -12,
    marginLeft: -6,
  },
}));

const useStylesSubmitButton = makeStyles((theme) => ({
  style: {
    height: theme.spacing(5),
    backgroundColor: '#15B785',
    color: 'white',
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

const CustomizedButton = ({
  id,
  onClickHandler,
  buttonLabel,
  loading,
}) => {
  const classes = useStylesSubmitButton();
  const customizedStyles = cuztomizedStyles();
  return (
    <div className={customizedStyles.loadingDiv}>
      <Button
        className={classes.style}
        id={id}
        variant="contained"
        disabled={loading}
        onClick={(e) => onClickHandler(e)}
      >
        {buttonLabel}
      </Button>
      {loading && <CircularProgress size={30} className={customizedStyles.buttonProgress} />}
    </div>
  );
};

CustomizedButton.propTypes = {
  id: string.isRequired,
  onClickHandler: func.isRequired,
  buttonLabel: string.isRequired,
  loading: bool.isRequired,
};

const GenerateSelect = ({ options, inputId, onChangeHandler }) => {
  const [value, setValue] = useState('');
  const inputLabel = React.useRef(null);
  const [labelWidth, setLabelWidth] = React.useState(0);

  React.useEffect(() => {
    setLabelWidth(inputLabel.current.offsetWidth);
  }, []);
  return (
    <FormControl required variant="outlined" className={cuztomizedStyles().formControl}>
      <InputLabel ref={inputLabel} id={`label-for-${inputId}`} style={{ backgroundColor: 'white', color: '#1A2B3F' }}>
        Create from
      </InputLabel>
      <Select
        labelId={`label-for-${inputId}`}
        id={inputId}
        value={value}
        labelWidth={labelWidth}
        input={<BorderedInput />}
        onChange={(e) => {
          onChangeHandler(e.target.value);
          setValue(e.target.value);
        }}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

GenerateSelect.propTypes = {
  options: arrayOf(string).isRequired,
  inputId: string.isRequired,
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
        toastr.success('Sucess:', 'The branch was created');
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
    const {
      branchSelected,
      newBranchName,
      redirect,
      loading,
    } = this.state;
    const isValidBranchName = this.validateBranchName(newBranchName);
    const isEnabledCreateBranchButton = ((branchSelected !== null && branchSelected !== '') && isValidBranchName);

    return redirect ? (
      <Redirect to={`/my-projects/${selectedProject.id}/${encodeURIComponent(newBranchName)}`} />
    ) : (
      <>
        <Navbar />
        <ProjectContainer
          project={selectedProject}
          activeFeature="data"
          folders={['Group Name', selectedProject.name, 'Data', 'New branch']}
        />
        <div className="main-content">
          <br />
          <div style={{ margin: '1%' }}>
            <Typography variant="h6" component="h2" style={{ color: '#1A2B3F' }}>
              New branch
            </Typography>
          </div>
          <br />
          <TextFieldFromControl
            id="new-branch-name"
            labelTxt="Branch name"
            onChangeHandler={(e) => this.setState({ newBranchName: e.target.value })}
          />
          <GenerateSelect
            options={branches}
            inputId="branches-select"
            onChangeHandler={this.setBranchSelected}
          />
          <div style={{
            display: 'flex',
            backgroundColor: '#F9F8F8',
            padding: '1em 2em',
            justifyContent: 'space-between',
          }}
          >
            <Button
              variant="contained"
              href={`/my-projects/${selectedProject.id}/master`}
            >
              Cancel
            </Button>
            {isEnabledCreateBranchButton ? (
              <CustomizedButton
                id="create-branch-btn"
                onClickHandler={this.handleCreateBranchEv}
                buttonLabel="Create branch"
                loading={loading}
              />
            ) : (
              <Button
                disabled
                type="button"
              >
                Create Branch
              </Button>
            )}
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
