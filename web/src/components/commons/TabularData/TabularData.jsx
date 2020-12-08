import React, {
  useState,
  useCallback,
} from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import cx from 'classnames';
import MAccordion from 'components/ui/MAccordion';
import MChart from 'components/ui/MChart';
import { fireModal, closeModal } from 'actions/actionModalActions';
import TabularDataFeeder from './TabularDataFeeder';
import TabularDataGraphCreator from './TabularDataGraphCreator';
import './TabularData.scss';
// import { inspect } from 'functions/apiCalls';

const TabularData = (props) => {
  const {
    className,
  } = props;

  const [matrix, setMatrix] = useState([[]]);
  const [data, setData] = useState([]);
  const [currentChart, setCurrentChart] = useState();
  const [charts, setCharts] = useState([]);

  const dispatch = useDispatch();

  const handleDataLoaded = (table) => {
    // console.log(table);
    setData(table.data);
    setMatrix(table.matrix);
  };

  const handleFieldChange = useCallback(
    (field) => {
      const changedData = data.map((row) => row.id !== field.y ? row : ({
        id: row.id,
        cols: row.cols.map((col) => col.x !== field.x ? col : field),
      }));

      setData(changedData);
    },
    [data, setData],
  );

  const handleDeleteRow = useCallback(
    (id) => {
      setData(data.filter((row) => row.id !== id));
    },
    [data, setData],
  );

  const addChart = (chart) => {
    setCharts(charts.concat(chart));
  };

  const openGraphCreator = () => {
    dispatch(fireModal({
      title: 'Create a Chart',
      noActions: true,
      content: (
        <TabularDataGraphCreator
          matrix={matrix}
          setChart={(c) => {
            addChart(c);
            dispatch(closeModal({ reset: true }));
          }}
        />
      ),
    }));
  };

  const removeChart = (c) => {
    setCharts(charts.filter(({ id }) => c.id !== id));
  };

  return (
    <div className={cx('tabular-data', className)}>
      <TabularDataFeeder onDataLoaded={handleDataLoaded} />
      <MAccordion className={cx({ hidden: !data.length })}>
        <MAccordion.Item title="Panels" defaultExpanded>
          <div>
            <div className="tabular-data-panels-add">
              <button
                type="button"
                label="add new serie"
                className="tabular-data-panels-add-btn btn btn-hidden fa fa-plus"
                onClick={openGraphCreator}
              />

            </div>
            <div className="tabular-data-panels-list">
              {charts.map((c) => (
                <li key={`chart-${c.id}`}>
                  <div className="d-flex">
                    <button
                      type="button"
                      label="view"
                      className="btn btn-icon fa fa-eye ml-auto"
                      onClick={() => setCurrentChart(c)}
                    />
                    <button
                      type="button"
                      label="close"
                      className="btn btn-icon fa fa-times ml-2"
                      onClick={() => removeChart(c)}
                    />
                  </div>
                  <img src={c.thumbnail} alt={c.title} />
                </li>
              ))}
            </div>
          </div>
        </MAccordion.Item>
        <MAccordion.Item title="Graph" defaultExpanded>
          <div>
            {currentChart && (
              <MChart
                table
                data={data}
                blueprints={currentChart.blueprints}
                onFieldChange={handleFieldChange}
                onDeleteRow={handleDeleteRow}
              />
            )}
          </div>
        </MAccordion.Item>
      </MAccordion>
    </div>
  );
};

TabularData.defaultProps = {
  className: '',
};

TabularData.propTypes = {
  className: PropTypes.string,
};

export default TabularData;
