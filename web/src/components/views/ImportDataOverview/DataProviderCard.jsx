import React from 'react';
import MProjectCardTypes from 'components/ui/MProjectCard/MProjectCardTypes';
import './DataProviderCard.scss';

const DataProviderCard = ({ name, description, tags, dataTypes, starsCount, avatarUrl, descriptionImage }) => {
  return (
  <div className="data-provider-card">
    <div className="data-provider-card-container">
      <div className="data-provider-card-container-header d-flex">
        <div
          className="avatar"
          style={{ 
            height: '40px',
            width: '40px',
            backgroundImage: `url(/${avatarUrl})`,
            backgroundRepeat: 'no-repeat'
          }}
        />
        <p className="data-provider-card-container-title">
          {name}
        </p>
      </div>
      <div className="data-provider-card-container-content">
        <p className="m-0">
          {description}
        </p>
      </div>
      <MProjectCardTypes types={dataTypes} />
      <br/>
      <div className="data-provider-card-container-gray-zone" style={{ backgroundImage: `url(/${descriptionImage})`, }} />
      <div className="data-provider-card-container-tags-zone">
        <p className="m-0">{`${tags?.map((tag) => ` ${tag?.name}`)} `}</p>
      </div>
      <div className="mt-2 t-secondary">
        <i className="fa fa-star">
          <span className="label ml-1">{starsCount}</span>
        </i>
      </div>
    </div>
  </div>
)};

export default DataProviderCard;
