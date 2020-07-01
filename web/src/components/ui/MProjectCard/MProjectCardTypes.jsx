import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

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
      {types.includes('TEXT') && (
        <div className="mr-2">
          <i className="fa fa-file t-success">
            <span className="label"> Text</span>
          </i>
        </div>
      )}

      {types.includes('AUDIO') && (
        <div className="mr-2">
          <i className="fa fa-volume-up t-info">
            <span className="label"> Audio</span>
          </i>
        </div>
      )}

      {types.includes('VIDEO') && (
        <div className="mr-2">
          <i className="fa fa-video t-danger">
            <span className="label"> Video</span>
          </i>
        </div>
      )}

      {types.includes('TABULAR') && (
        <div className="mr-2">
          <i className="fas fa-grip-lines-vertical t-warning">
            <span className="label"> Tabular</span>
          </i>
        </div>
      )}

      {types.includes('IMAGE') && (
        <div className="mr-2">
          <i className="fas fa-images" style={{ color: '#D2519D' }}>
            <span className="label"> Images</span>
          </i>
        </div>
      )}
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
