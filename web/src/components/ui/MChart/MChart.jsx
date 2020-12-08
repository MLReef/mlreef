import React, { Suspense, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import MDataTable from 'components/ui/MDataTable';
import { useUnfoldValue } from 'customHooks/charts';
import './MChart.scss';

const Plot = React.lazy(() => import('customImports/ReactPlotly'));

const MChart = (props) => {
  const {
    data,
    blueprints,
    onFieldChange,
    onDeleteRow,
    layout,
    table,
  } = props;

  const getColumn = useCallback(
    (x) => data.map((row) => row.cols.find((col) => col.x === x)?.value),
    [data],
  );

  const unfoldValue = useUnfoldValue(getColumn);

  const series = useMemo(
    () => blueprints?.map((bp) => bp.params.reduce((acc, p) => ({
      ...acc,
      [p.name]: unfoldValue(p),
    }), {})),
    [blueprints, unfoldValue],
  );

  const actives = useMemo(
    () => blueprints?.map((bp) => bp.params.filter((p) => p.type === 'col')
      .reduce((acc, p) => p.type !== 'col' ? acc : ({
        ...acc,
        cols: acc.cols.concat(parseInt(p.value, 10)),
      }), { ...bp.params?.find((p) => p.type === 'color'), cols: [] })),
    [blueprints],
  );

  // const actives = [];

  return (
    <div className="m-chart">
      <div>
        <Suspense fallback={<div>loading...</div>}>
          <Plot
            data={series}
            config={{ modeBarButtonsToRemove: ['sendDataToCloud', 'autoScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian', 'lasso2d', 'select2d'], displaylogo: false, showTips: true }}
            layout={layout}
          />
        </Suspense>
      </div>
      {table && (
        <MDataTable
          data={data}
          editable
          onFieldChange={onFieldChange}
          actives={actives}
          onDeleteRow={onDeleteRow}
        />
      )}
    </div>
  );
};

MChart.defaultProps = {
  layout: {
    width: 800,
    height: 600,
    title: 'A Fancy Plot',
    showlegend: true,
  },
  onDeleteRow: null,
  onFieldChange: null,
  table: false,
};

MChart.propTypes = {
  layout: PropTypes.shape({}),
  data: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    cols: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
      ]),
    })),
  })).isRequired,
  blueprints: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    params: PropTypes.arrayOf(PropTypes.shape).isRequired,
  })).isRequired,
  onFieldChange: PropTypes.func,
  onDeleteRow: PropTypes.func,
  table: PropTypes.bool,
};

export default MChart;
