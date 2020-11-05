import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import DataCard from 'components/layout/DataCard';

const title = 'Data';
const content = [
  { text: 'Files selected from path' },
  {
    text: 'Folder Name',
    isLink: true,
    href: '/some-path',
  },
  { text: 'from' },
  { text: 'Branch Name' },
];

const setup = () => {
  const testWrapper = shallow(
    <DataCard title={title} linesOfContent={content} styleClasses="model" />,
  );
  return testWrapper;
};

test('assert that snapshot matches', () => {
  const snapShot = renderer.create(
    <DataCard title={title} linesOfContent={content} />,
  ).toJSON();
  expect(snapShot).toMatchSnapshot();
});

describe('Data instance details contains basic UI elements', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = setup();
  });

  it('assert the data card title', () => {
    expect(wrapper.find('.title').text()).toEqual('Data');
  });

  it('assert that lines of content are rendered correctly', () => {
    expect(wrapper.find('.line')).toHaveLength(3);
    expect(wrapper.find('a')).toHaveLength(1);
  });
});
