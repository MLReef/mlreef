import React from 'react';
import {
  string, arrayOf, bool, shape,
} from 'prop-types';
import './DataCard.scss';

const DataCard = ({ title, linesOfContent }) => (
  <div className="data-card">
    <div className="title">
      <p><b>{title}</b></p>
    </div>
    <div>
      {linesOfContent?.map((line) => {
        const lineContent = line?.text?.startsWith('*')
          ? <b>{line.text.replace('*', '')}</b>
          : line.text;
        return line?.isLink
          ? (
            <a key={line?.text} target="_blank" rel="noopener noreferrer" href={line.href}>
              <b>{lineContent}</b>
            </a>
          )
          : <p key={line?.text} className="line">{lineContent}</p>;
      })}
    </div>
  </div>
);

DataCard.propTypes = {
  title: string.isRequired,
  linesOfContent: arrayOf(
    shape({
      text: string.isRequired,
      isLink: bool,
    }),
  ).isRequired,
};

export default DataCard;
