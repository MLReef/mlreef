import React from 'react';
import { mount } from 'enzyme';
import DataProviderCard from 'components/views/ImportDataOverview/DataProviderCard';
import { dataArchives } from 'components/views/ImportDataOverview/data';

const dataProv = dataArchives[0];

const setup = () => mount(
  <DataProviderCard
    name={dataProv.name}
    description={dataProv.description}
    tags={dataProv.tags}
    dataTypes={dataProv.dataTypes}
    starsCount={dataProv.starsCount}
  />,
);

describe('test html elements', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert basic rendering of html elements in card', () => {
    expect(wrapper.find('p.data-provider-card-container-title').text()).toBe(dataProv.name);
    expect(wrapper.find('div.data-provider-card-container-content').childAt(0).text()).toBe(dataProv.description);

    const projectCardValues = wrapper.find('.project-card-types')
      .children()
      .slice(1)
      .map((iconDiv) => iconDiv
        .childAt(0)
        .childAt(0)
        .text()
        .toLowerCase()
        .trim());
    console.log(projectCardValues);
    expect(projectCardValues[0]).toBe('video');
    expect(projectCardValues[1]).toBe('hier');
    expect(
      wrapper
        .find('.data-provider-card-container-tags-zone')
        .childAt(0)
        .text()
      )
      .toBe(`${dataProv.tags?.map((tag) => ` ${tag?.name}`)} `);
    expect(wrapper.find('i.fa.fa-star').childAt(0).text()).toBe(dataProv.starsCount.toString());
  });
});
