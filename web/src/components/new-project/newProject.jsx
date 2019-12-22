import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import RadioGroup from '@material-ui/core/RadioGroup';
import { makeStyles } from '@material-ui/core/styles';
import Radio from '@material-ui/core/Radio';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import Navbar from '../navbar/navbar';
import './newProject.css';

const useStyles = makeStyles(() => ({
  checkbox: {
    paddingLeft: '0',
  },
}));

const NewProject = () => {
  const dataTypes = ['Text', 'Image', 'Audio', 'Video', 'Tabular', 'Sensor', 'Number', 'Binary', 'Model'];
  const publicIcon = 'https://gitlab.com/mlreef/frontend/uploads/b93c33fb581d154b037294ccef81dadf/global-01.png';
  const privateIcon = 'https://gitlab.com/mlreef/frontend/uploads/83b8885be99f4176f1749924772411b3/lock-01.png';
  const [value, setValue] = useState('Private');
  const [input, setInput] = useState('');
  const classes = useStyles();

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleInput = (event) => {
    setInput(event.target.value);
  };

  const [user, setUser] = React.useState('');

  const handleUser = (event) => {
    setUser(event.target.value);
  };

  const convertToSlug = (Text) => Text
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[-]+/g, '-')
    .replace(/[^\w-]+/g, '');

  return (
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
                onChange={handleInput}
                className="text-input"
                id="projectTitle"
                type="text"
                placeholder="My awesome ML Project"
              />
            </label>
            <div style={{ display: 'flex' }}>
              <label className="label-name" htmlFor="projectURL">
                <span className="heading">Project URL</span>
                <div style={{ display: 'flex' }}>
                  <Tooltip arrow={true} disableFocusListener disableTouchListener title="https://mlreef.com/">
                    <Button>https://mlreef.com/</Button>
                  </Tooltip>
                  <FormControl id="projectURL" variant="outlined">
                    <Select
                      labelId="demo-simple-select-outlined-label"
                      id="demo-simple-select-outlined"
                      value={user}
                      onChange={handleUser}
                    >
                      <MenuItem value="cpmlreef">cpmlreef</MenuItem>
                      <MenuItem value="SaathvikT">SaathvikT</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </label>
              <label className="label-name" htmlFor="projectSlug" style={{ paddingLeft: '2em' }}>
                <span className="heading">Project Slug</span>
                <input
                  value={convertToSlug(input)}
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
                id="projectDescription"
                rows="4"
                maxLength="250"
                spellCheck="false"
                placeholder="Description Format"
              />
            </label>
            <span className="label-name" htmlFor="data_types">
              <span className="heading">Data Types</span>
              <span style={{ color: '#919191', marginTop: '0.5em' }}>Select what data types your project will be based on</span>
              <div className="data-types">
                {dataTypes.map((type, index) => (
                  <div key={index.toString()}>
                    <Checkbox
                      id={`data_types${index.toString()}`}
                      color="primary"
                      inputProps={{
                        'aria-label': 'primary checkbox',
                      }}
                    />
                    <span>{type}</span>
                  </div>
                ))}
              </div>
            </span>
            <div style={{ marginTop: '1em' }}>
              <span className="heading">Visibilty level</span>
              <RadioGroup aria-label="visibility" name="visibility" value={value} onChange={handleChange}>
                <FormControlLabel
                  className="heading"
                  value="Private"
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
                  value="Public"
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
                inputProps={{
                  'aria-label': 'primary checkbox',
                }}
                className={classes.checkbox}
              />
              <span className="heading">Initialize the Repository with a README</span>
              <p className="readme-msg">
Allows you to immediately clone this projects repository.
Skip this if you want to push up an existing repository
              </p>
            </div>
            <div className="form-controls">
              <button
                type="button"
                className="cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                className="create"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default NewProject;
