import React, { useState } from 'react';
import advice_01 from '../../images/advice-01.png';
import './instruction.css';

export const Instruction = ({ titleText, paragraph }) => {
  const [isShown, setIsShown] = useState(true);
  return (
    isShown
      ? (
        <div id="instruction-pipe-line">
          <div id="icon">
            <img src={advice_01} alt="" />
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
            <button onClick={() => setIsShown(!isShown)}>
                    X
            </button>
          </div>
        </div>
      )
      : null
  );
};
