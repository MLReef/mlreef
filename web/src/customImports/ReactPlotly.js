const loadReactPlotly = () => {
  // eslint-disable-next-line
  const createPlotlyComponent = require('react-plotly.js/factory').default;
  // eslint-disable-next-line
  const Plotly = require('plotly.js/lib/core');

  Plotly.register([
    // eslint-disable-next-line
    require('plotly.js/lib/heatmap'),
    // eslint-disable-next-line
    require('plotly.js/lib/choropleth'),
    // eslint-disable-next-line
    require('plotly.js/lib/scattergeo'),
  ]);

  return createPlotlyComponent(Plotly);
};

export default loadReactPlotly();
