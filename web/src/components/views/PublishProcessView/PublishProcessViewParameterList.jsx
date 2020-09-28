import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import checkErrors from './checkParameterErrors';

const PublishProcessViewParameterList = (props) => {
  const {
    parameters,
  } = props;

  return (
    <div className="publishing-process-view-featured-list">
      <div className="">
        {parameters.map(checkErrors).map((param) => (
          <div
            key={param.name}
            className="publishing-process-view-featured-list-item"
          >
            <div className="item-name">
              <div className="item-name-label">
                Param:
              </div>
              <div className={cx('item-name-value', param.error && 't-danger')}>
                {param.name}
              </div>
            </div>
            <div className="item-attribute">
              <div className="item-attribute-label">
                Input type:
              </div>
              <div className="item-attribute-value">
                {param.type}
              </div>
            </div>
            {param.values && (
              <div className="item-attribute">
                <div className="item-attribute-label">
                  Values:
                </div>
                <div className="item-attribute-value">
                  <span>
                    {Array.isArray(param.values) ? param.values.join(', ') : param.values}
                  </span>
                  {param.error?.type === 'values' && (
                    <span className="t-danger ml-5">
                      {`--> error: ${param.error.message}`}
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="item-attribute">
              <div className="item-attribute-label">
                Default:
              </div>
              <div className="item-attribute-value">
                <span>
                  {param.defaultValue || '---'}
                </span>
                {param.error?.type === 'defaultValue' && (
                  <span className="t-danger ml-5">
                    {`--> error: ${param.error.message}`}
                  </span>
                )}
              </div>
            </div>
            <div className="item-attribute">
              <div className="item-attribute-label">
                Range:
              </div>
              <div className="item-attribute-value">
                <span>
                  {param.range?.join('...') || '---'}
                </span>
                {param.error?.type === 'range' && (
                  <span className="t-danger ml-5">
                    {`--> error: ${param.error.message}`}
                  </span>
                )}
              </div>
            </div>
            <div className="item-attribute">
              <div className="item-attribute-label">
                Description:
              </div>
              <div className="item-attribute-value">
                {param.description || '---'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

PublishProcessViewParameterList.defaultProps = {

};

PublishProcessViewParameterList.propTypes = {
  parameters: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.oneOf([
      'Integer',
      'List',
    ]).isRequired,
    defaultValue: PropTypes.any,
    values: PropTypes.arrayOf(PropTypes.string),
    range: PropTypes.arrayOf(PropTypes.any),
    description: PropTypes.string,
  })).isRequired,
};

export default PublishProcessViewParameterList;
