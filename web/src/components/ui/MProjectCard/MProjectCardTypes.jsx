import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { PROJECT_DATA_TYPES } from 'domain/project/ProjectDataTypes';

const dataTypesMetadata = [
  { label: 'Any', dataTypeName: PROJECT_DATA_TYPES.ANY, icon: 'fas fa-archive' },
  { label: 'Audio', dataTypeName: PROJECT_DATA_TYPES.AUDIO, icon: 'fa fa-volume-up t-info' },
  { label: 'Bin', dataTypeName: PROJECT_DATA_TYPES.BINARY, icon: 'fas fa-barcode t-info' },
  { label: 'None', dataTypeName: PROJECT_DATA_TYPES.NONE, icon: '' },
  { label: 'Hier', dataTypeName: PROJECT_DATA_TYPES.HIERARCHICAL, icon: 'fas fa-sitemap t-info' },
  { label: 'Image', dataTypeName: PROJECT_DATA_TYPES.IMAGE, icon: 'fas fa-images', style: { color: '#D2519D' }},
  { label: 'Tabular', dataTypeName: PROJECT_DATA_TYPES.TABULAR, icon: 'fas fa-grip-lines-vertical t-warning' },
  { label: 'Text', dataTypeName: PROJECT_DATA_TYPES.TEXT, icon: 'fa fa-file t-success' },
  { label: 'T.Series', dataTypeName: PROJECT_DATA_TYPES.TIME_SERIES, icon: 'fas fa-hourglass-end', style: { color: '#D2519D' }},
  { label: 'Video', dataTypeName: PROJECT_DATA_TYPES.VIDEO, icon: 'fa fa-video t-danger' },
  { label: 'Model', dataTypeName: PROJECT_DATA_TYPES.MODEL, icon: 'fas fa-project-diagram', style: { color: '#D2519D' }},
  { label: 'Number', dataTypeName: PROJECT_DATA_TYPES.NUMBER, icon: 'fas fa-calculator t-info' },
];

const MProjectCardTypes = (props) => {
  const {
    input,
    output,
    types,
  } = props;

  return (
    <div className="project-card-types d-flex">
      {types.length > 0 && (
        <div className="project-card-types-icon">
          <i className={cx({
            fas: true,
            'fa-sign-in-alt': input,
            'fa-sign-out-alt': output,
          })}
          />
        </div>
      )}
      {types.map((type) => {
        const metaData = dataTypesMetadata.filter((dtMeta) => type === dtMeta.dataTypeName)[0];
        return (
          <div className="mr-2">
            <i className={metaData.icon} style={metaData.style}>
              <span className="label">{` ${metaData.label}`}</span>
            </i>
          </div>
        );
      })}
    </div>
  );
};

MProjectCardTypes.defaultProps = {
  types: [],
  input: false,
  output: false,
};

MProjectCardTypes.propTypes = {
  types: PropTypes.arrayOf(PropTypes.string),
  input: PropTypes.bool,
  output: PropTypes.bool,
};

export default MProjectCardTypes;
