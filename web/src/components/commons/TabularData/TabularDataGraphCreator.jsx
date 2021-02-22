import React, {
  useState,
  useMemo,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import genUUID from 'uuid/v1';
import { useUnfoldValue } from 'customHooks/charts';
import plotTypes from './plotTypes';
import './TabularDataGraphCreator.scss';

const TabularDataGraphCreator = (props) => {
  const {
    className,
    matrix,
    setChart,
  } = props;

  // eslint-disable-next-line
  const Plotly = require('plotly.js/lib/core');

  const getColumn = useCallback(
    (x) => matrix.slice(1).map((row) => row.find((cols, i) => i === x)),
    [matrix],
  );

  const unfoldValue = useUnfoldValue(getColumn);

  const labels = useMemo(
    () => matrix[0].map((label, value) => ({ label, value })),
    [matrix],
  );

  const [plotType, setPlotType] = useState();
  const [blueprints, setBlueprints] = useState([]);

  const [layout, setLayout] = useState({ width: 800, height: 600, title: 'A plot' });

  const handleSelectPlotType = (t) => () => {
    setPlotType(t);
  };

  const handleReset = () => {
    setPlotType(null);
    setBlueprints([]);
  };

  const handleNewSerie = () => {
    setBlueprints(blueprints.concat({
      id: genUUID(),
      params: [...plotType.settings?.params],
    }));
  };

  const handleChangeParam = (id, attr, param) => (e) => {
    const bps = blueprints.map((bp) => bp.id !== id
      ? bp : ({
        id,
        params: bp.params.map((p) => p.name !== param.name ? p : ({
          ...p,
          [attr]: e.target.value,
        })),
      }));

    setBlueprints(bps);
  };

  const handleChangeLayout = (name) => (e) => {
    setLayout({
      ...layout,
      [name]: e.target.value,
    });
  };

  const execute = () => {
    const data = blueprints?.map((bp) => bp.params.reduce((acc, p) => ({
      ...acc,
      [p.name]: unfoldValue(p),
    }), {}));

    const thumbnailLayout = {
      ...layout,
      showlegend: false,
      margin: {
        l: 40, r: 20, t: 40, b: 20,
      },
      width: 800,
      height: 600,
    };

    Plotly.newPlot('plot-hook', data, thumbnailLayout)
      .then((gd) => Plotly.toImage(gd, { height: 200, width: 280 }))
      .then((thumbnail) => {
        setChart({
          id: genUUID(),
          thumbnail,
          layout,
          blueprints,
        });
      });
  };

  return (
    <div className={cx('tabular-data-graph-creator', className)}>
      {!plotType ? (
        <div>
          <div>
            <label htmlFor="input-name">Name:</label>
            <input
              id="input-name"
              value={layout.title}
              onChange={handleChangeLayout('title')}
            />
          </div>

          <h3>Select type:</h3>
          <ul>
            {plotTypes.map((t) => (
              <li key={t.value}>
                <button
                  type="button"
                  className="btn btn-outline-dark mb-2"
                  onClick={handleSelectPlotType(t)}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="tabular-data-graph-creator-series">
          <h3>Chart settings:</h3>
          <h4>Series:</h4>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={handleNewSerie}
          >
            new
          </button>
          <ul className="tabular-data-graph-creator-series-list">
            {blueprints.map((b) => (
              <li key={b.id} className="tabular-data-graph-creator-series-list-item">
                <ul>
                  {b.params.map((p) => (
                    <li key={p.name}>
                      {p.type === 'text' && (
                        <div className="tabular-data-graph-creator-text">
                          <label htmlFor="name">{p.label}</label>
                          <input
                            id="name"
                            className="tabular-data-graph-creator-text-input"
                            type="text"
                            value={p.value}
                            onChange={handleChangeParam(b.id, 'value', p)}
                          />
                        </div>
                      )}
                      {p.type === 'col' && (
                        <div className="tabular-data-graph-creator-axis-col">
                          <div className="tabular-data-graph-creator-axis-col-field">
                            <label>
                              {p.label}
                            </label>
                            <select value={p.value} onChange={handleChangeParam(b.id, 'value', p)}>
                              <option>select</option>
                              {labels.map((l) => (
                                <option key={l.value} value={l.value}>
                                  {l.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="tabular-data-graph-creator-axis-col-field">
                            <label>
                              {`${p.label} transformation`}
                            </label>
                            <select disabled>
                              <option>select</option>
                            </select>
                          </div>
                        </div>
                      )}
                      {p.type === 'range' && (
                        <div className="tabular-data-graph-creator-axis-range">
                          <h5>{p.label}</h5>
                          <div className="tabular-data-graph-creator-axis-range-field">
                            <label htmlFor="min-range">min</label>
                            <input disabled={p.disabled} onChange={handleChangeParam(b.id, 'min', p)} value={p.min} type="number" />
                          </div>
                          <div className="tabular-data-graph-creator-axis-range-field">
                            <label htmlFor="min-range">max</label>
                            <input disabled={p.disabled} onChange={handleChangeParam(b.id, 'max', p)} value={p.max} type="number" />
                          </div>
                        </div>
                      )}
                      {p.type === 'select' && (
                        <div>
                          <label>{p.label}</label>
                          <select value={p.value} onChange={handleChangeParam(b.id, 'value', p)}>
                            {p.options.map((op) => (
                              <option key={op.value} value={op.value}>
                                {op.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      {p.type === 'color' && (
                        <div className="tabular-data-graph-creator-color">
                          <label>{`${p.label} color`}</label>
                          <input
                            className="tabular-data-graph-creator-color-picker"
                            type="color"
                            value={p.color}
                            onChange={handleChangeParam(b.id, 'color', p)}
                          />
                          {p.size && (
                            <div className="tabular-data-graph-creator-color-size">
                              <label htmlFor="input-size">Size</label>
                              <input
                                id="input-size"
                                min="1"
                                max="10"
                                type="number"
                                value={p.size}
                                onChange={handleChangeParam(b.id, 'size', p)}
                              />
                            </div>
                          )}
                          {p.width && (
                            <div className="tabular-data-graph-creator-color-size">
                              <label htmlFor="input-width">Width</label>
                              <input
                                id="input-width"
                                min="1"
                                max="4"
                                type="number"
                                value={p.width}
                                onChange={handleChangeParam(b.id, 'width', p)}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <div className="d-flex">
            <button onClick={handleReset} type="button" className="btn btn-basic-dark ml-auto mr-3">
              Reset
            </button>
            <button onClick={execute} type="button" className="btn btn-primary">
              Done
            </button>
          </div>
        </div>
      )}
      <div className="d-none">
        <div id="plot-hook" />
      </div>
    </div>
  );
};

TabularDataGraphCreator.defaultProps = {
  className: '',
};

TabularDataGraphCreator.propTypes = {
  className: PropTypes.string,
  matrix: PropTypes.arrayOf(PropTypes.array).isRequired,
  setChart: PropTypes.func.isRequired,
};

export default TabularDataGraphCreator;
