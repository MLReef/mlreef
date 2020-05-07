/* eslint-disable no-undef */
import '@testing-library/jest-dom/extend-expect';

import React from 'react';
import { cleanup } from '@testing-library/react';
import { shallow } from 'enzyme';
import dataPipeLines from 'testData';
import { DataOperationsList } from '../components/pipeline-view/dataOperationsList';

// automatically unmount and cleanup DOM after the test is finished.
afterEach(cleanup);

const setup = () => shallow(
  <DataOperationsList
    handleDragStart={() => { }}
    whenDataCardArrowButtonIsPressed={() => { }}
    dataOperations={dataPipeLines}
  />,
);

describe('check processors on the first render', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that data pipeline cards are shown', () => {
    expect(wrapper.find('.data-operation-item').forEach((node) => {
      expect(node.hasClass('round-border-button shadowed-element')).to.equal(true);
    }));
  });
});
