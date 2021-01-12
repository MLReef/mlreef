import React from 'react';
import { mount } from 'enzyme';
import DataProvidersTab from 'components/views/ImportDataOverview/DataProvidesTab';

const setup = () => mount(
  <DataProvidersTab />,
);

describe('test basic rendering', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that DataProvTab renders placeholder when prov array is empty', () => {
    const filterButtons = wrapper.find('div.data-providers-tab-buttons').children();

    expect(filterButtons).toHaveLength(2);
    expect(filterButtons.at(0).text()).toBe('Explore');
    expect(filterButtons.at(1).text()).toBe('Starred');

    // assert that loading gif renders instead of cards and it's centered
    const { backgroundImage, marginLeft } = wrapper.find('div.data-providers-tab-cards').childAt(0).props().style;
    expect(backgroundImage).toBe('url(/images/MLReef_loading.gif)');
    expect(marginLeft).toBe('50%');

    const checkBoxes = wrapper
      .find('MCheckBox')
      .map((checkBoxEl) => checkBoxEl.childAt(0).childAt(0).text().toLowerCase());
    expect(checkBoxes[0]).toBe('images');
    expect(checkBoxes[1]).toBe('text');
    expect(checkBoxes[2]).toBe('tabular');
    expect(checkBoxes[3]).toBe('video');
  });
});
