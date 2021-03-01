import React from 'react';
import {
  string, arrayOf, bool, shape,
} from 'prop-types';
import './DataCard.scss';

const DataCard = ({ title, linesOfContent, styleClasses }) => (
  <div className="data-card ml-2 mr-2">
    <div className={`title ${styleClasses}`}>
      <p><b>{title}</b></p>
    </div>
    <div className="data-card-rows">
      {linesOfContent?.map((line) => {
        const lineContent = line?.text?.startsWith('*')
          ? <b>{line.text.replace('*', '')}</b>
          : line.text;
        return line?.isLink
          ? (
            <div className="link">
              <a key={line?.text} target="_blank" rel="noopener noreferrer" href={line.href}>
                <b>{lineContent}</b>
              </a>
            </div>
          )
          : <p key={line?.text} className="line">{lineContent}</p>;
      })}
    </div>
  </div>
);

DataCard.defaultProps = {
  styleClasses: '',
};

DataCard.propTypes = {
  title: string.isRequired,
  linesOfContent: arrayOf(
    shape({
      text: string.isRequired,
      isLink: bool,
    }),
  ).isRequired,
  styleClasses: string,
};

export default DataCard;
