import React from 'react';
import { shallow } from 'enzyme';
import MSimpleTabs from 'components/ui/MSimpleTabs';

const setup = (options = {}) => {
  const {
    sections,
    vertical,
  } = options;

  return shallow(
    <MSimpleTabs
      sections={sections || []}
      vertical={vertical}
    />,
  );
};

describe('MSimpleTabs basics', () => {
  const sections = [
    {
      label: 'Label One',
      content: <div id="one-content">test</div>,
    },
    {
      label: 'Label Two',
      content: 'ONLY TEXT',
    },
  ];

  const wrapper = setup({ sections });

  test('assert render', () => {
    expect(wrapper.find('#one-content')).toHaveLength(1);
  });

  test('assert that there are two tabs', () => {
    expect(wrapper.find('.simple-tabs-menu-tab'))
      .toHaveLength(sections.length);
  });

  test('assert that there are two contents', () => {
    expect(wrapper.find('.simple-tabs-content-section'))
      .toHaveLength(sections.length);
  });
});
