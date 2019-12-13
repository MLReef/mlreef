import React, { useState, useRef } from 'react';
import {
  arrayOf, string, func,
} from 'prop-types';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import {
  makeStyles,
} from '@material-ui/core/styles';
import BorderedInput from './BlueBorderedInput';

const cuztomizedStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: 120,
    width: '100%',
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

const CustomizedSelect = ({
  options, inputId, onChangeHandler, inputLabelText,
}) => {
  const [value, setValue] = useState('');
  const inputLabel = useRef(null);
  const [labelWidth, setLabelWidth] = useState(0);

  React.useEffect(() => {
    setLabelWidth(inputLabel.current.offsetWidth);
  }, []);
  return (
    <FormControl required variant="outlined" className={cuztomizedStyles().formControl}>
      <InputLabel ref={inputLabel} id={`label-for-${inputId}`} style={{ backgroundColor: 'white', color: '#1A2B3F' }}>
        {inputLabelText}
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

CustomizedSelect.propTypes = {
  options: arrayOf(string).isRequired,
  inputId: string.isRequired,
  onChangeHandler: func.isRequired,
  inputLabelText: string.isRequired,
};

export default CustomizedSelect;
