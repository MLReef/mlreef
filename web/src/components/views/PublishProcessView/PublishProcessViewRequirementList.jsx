import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

const PublishProcessViewRequirementList = (props) => {
  const {
    requeriments,
  } = props;

  return (
    <div className="publishing-process-view-featured-list">
      <div className="">
        {requeriments.map((req) => (
          <div
            key={req.name}
            className="publishing-process-view-featured-list-item"
          >
            <div className="item-name">
              <div className="item-name-label">
                Requeriment:
              </div>
              <div
                className={cx(
                  'item-name-value',
                  req.warning && 't-warning',
                  req.error && 't-danger',
                )}
              >
                {req.name}
              </div>
            </div>
            <div className="item-attribute">
              <div className="item-attribute-label wide">
                Version specified:
              </div>
              <div className="item-attribute-value">
                {req.specified || 'none'}
              </div>
            </div>
            <div className="item-attribute">
              <div className="item-attribute-label wide">
                Version installed by pip:
              </div>
              <div className="item-attribute-value">
                <span>
                  {req.installed}
                </span>
                {req.error && (
                  <span className="t-danger ml-5">
                    {`--> error: ${req.error.message}`}
                  </span>
                )}
                {req.warning && (
                  <span className="t-warning ml-5">
                    {`--> warning: ${req.warning.message}`}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

PublishProcessViewRequirementList.defaultProps = {

};

PublishProcessViewRequirementList.propTypes = {
  requeriments: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    specified: PropTypes.string,
    installed: PropTypes.string,
    error: PropTypes.shape({
      type: PropTypes.string,
      message: PropTypes.string,
    }),
    warning: PropTypes.shape({
      type: PropTypes.string,
      message: PropTypes.string,
    }),
  })).isRequired,
};

export default PublishProcessViewRequirementList;
