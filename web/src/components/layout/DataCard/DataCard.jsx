import React from 'react';
import { string, arrayOf } from 'prop-types';
import './DataCard.scss';

const DataCard = ({ title, linesOfContent }) => (
  <div className="data-card">
    <div className="title">
      <p><b>{title}</b></p>
    </div>
    <div>
      {linesOfContent && linesOfContent.map((line, lineIndex) => {
        const lineContent = line.startsWith('*')
          ? <b>{line.replace('*', '')}</b>
          : line;
        return <p key={`${title} ${line} ${lineIndex.toString()}`} className="line">{lineContent}</p>;
      })}
    </div>
  </div>
);

DataCard.propTypes = {
  title: string.isRequired,
  linesOfContent: arrayOf(string).isRequired,
};

export default DataCard;
