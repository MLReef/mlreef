import MBricksWall from 'components/ui/MBricksWall';
import MDataFilters from 'components/ui/MDataFilters';
import React, { useEffect, useState } from 'react';
import { dataArchives, filters } from './data';
import DataProviderCard from './DataProviderCard';

const iconGrey = '/images/icon_grey-01.png';

const simulatedPromise = new Promise((resolve) => {
  setTimeout(() => {
    resolve(dataArchives);
  }, 2000);
});

const DataProvidersTab = () => {
  const [dataProvs, setDataProvs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    simulatedPromise
      .then((data) => setDataProvs(data))
      .finally(() => setIsLoading(false));
  });

  function renderCardsAndPlaceholders(data, loading) {
    if (loading) {
      return (
        <div style={{
          backgroundImage: 'url(/images/MLReef_loading.gif)',
          height: '150px',
          backgroundRepeat: 'no-repeat',
          marginLeft: '50%',
        }}
        />
      );
    }
    return data?.length > 0 ? (
      <MBricksWall
        className="w-100"
        animated
        bricks={data.map((dataProv) => (
          <DataProviderCard
            name={dataProv.name}
            description={dataProv.description}
            dataTypes={dataProv.dataTypes}
            tags={dataProv.tags}
            starsCount={dataProv.starsCount}
            avatarUrl={dataProv.avatarUrl}
            descriptionImage={dataProv.descriptionImage}
          />
        ))}
      />
    ) : (
      <div className="data-providers-tab-cards-empty mt-1">
        <div className="d-flex">
          <img src={iconGrey} alt="" />
        </div>
        <p>No description</p>
      </div>
    );
  }

  return (
    <div className="data-providers-tab">
      <div className="data-providers-tab-buttons">
        <button
          type="button"
          className="btn btn-basic-dark"
        >
          Explore
        </button>
        <button
          type="button"
          className="btn btn-basic-dark"
        >
          Starred
        </button>
      </div>
      <div className="d-flex">
        <div className="data-providers-tab-cards w-100">
          {renderCardsAndPlaceholders(dataProvs, isLoading)}
        </div>
        <MDataFilters filters={filters} />
      </div>
    </div>
  );
};

export default DataProvidersTab;
