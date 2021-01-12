import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { dataTypesMetadata } from 'dataTypes';

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
          <div className="mr-2" key={metaData.dataTypeName}>
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
