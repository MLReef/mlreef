import React, { useState } from 'react';
import { string } from 'prop-types';
import advice01 from '../../images/advice-01.png';
import './instruction.css';

const Instruction = ({ titleText, paragraph }) => {
  const [isShown, setIsShown] = useState(true);
  return (
    isShown
      ? (
        <div id="instruction-pipe-line">
          <div id="icon">
            <img src={advice01} alt="" />
          </div>
          <div id="instruction">
            <p id="title">
              {' '}
              <b>{titleText}</b>
            </p>
            <p>
              {paragraph}
            </p>
          </div>
          <div id="xButton">
            <button
              type="button"
              onClick={() => setIsShown(!isShown)}
            >
              X
            </button>
          </div>
        </div>
      )
      : null
  );
};

Instruction.propTypes = {
  titleText: string.isRequired,
  paragraph: string.isRequired,
};

export default Instruction;
