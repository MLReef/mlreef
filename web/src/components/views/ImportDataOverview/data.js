export const dataArchives = [{
  name: 'Sentinel Hub',
  avatarUrl: 'images/sentinelHub.jpg',
  description: `We make satellite data(Sentinels, landsat, and other providers)
      easily accessible for you to be browsed or analyzed,
      within our cloud GIS or within your own environment`,
  descriptionImage: 'images/images.png',
  dataTypes: [
    'VIDEO',
    'HIERARCHICAL',
  ],
  tags: [
    { name: 'Earth Observation' },
    { name: 'Sattelite imagery' },
    { name: 'Sentinel 1' },
    { name: 'Sentinel 2' },
    { name: 'ESA' },
  ],
  starsCount: 2154,
},
{
  name: 'Radiant Earth',
  avatarUrl: 'images/colorSpots.jpg',
  description: `Radiant Earth Foundation is focused on applying machine learning for
      Earth observation to meet the Sustainable Development Goals - the world's most critical challenges`,
  descriptionImage: 'images/picturesRainbow.jpg',
  dataTypes: [
    'IMAGE',
  ],
  tags: [
    { name: 'Earth Observation data' },
    { name: 'EO' },
    { name: 'NASA' },
    { name: 'ESA' },
    { name: 'sattelite imagery' },
    { name: 'sustainable development goals' },
  ],
  starsCount: 1997,
}];

export const filters = [{
  name: 'Data type',
  selected: null,
  options: [
    {
      name: 'Images',
      value: 1,
    },
    {
      name: 'Text',
      value: 2,
    },
    {
      name: 'Tabular',
      value: 3,
    },
    {
      name: 'Video',
      value: 4,
    },
  ],
}];
