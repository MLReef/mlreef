import React from 'react';
import renderer from 'react-test-renderer';
import { BrowserRouter as Router } from 'react-router-dom';
import { mount } from 'enzyme';
import { filesInScrollableSection } from 'testData';
import ImageDiffSection from 'components/imageDiffSection/imageDiffSection';
import MScrollableSection from 'components/ui/MScrollableSection/MScrollableSection';

const className = 'diff-sections';
const handleOnScrollDown = jest.fn();
const children = filesInScrollableSection.map((file) => (
  <ImageDiffSection
    key={file.fileName}
    fileInfo={file.props.fileInfo}
    fileSize={file.props.fileSize}
    original={file.props.original}
    modified={file.props.modified}
  />
));

const setup = () => {
  const testWrapper = mount(
    <Router>
      <MScrollableSection
        className={className}
        handleOnScrollDown={handleOnScrollDown}
      >
        {children}
      </MScrollableSection>
    </Router>,
  );
  return testWrapper;
};

test('assert that snapshot matches', () => {
  const snapShot = renderer.create(
    <Router>
      <MScrollableSection
        className={className}
        handleOnScrollDown={handleOnScrollDown}
      >
        {children}
      </MScrollableSection>
    </Router>,
  ).toJSON();
  expect(snapShot).toMatchSnapshot();
});

describe('check scrollable section renders elements', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = setup();
  });

  it('contains children elements', () => {
    expect(wrapper.find('.diff-sections').children()).toHaveLength(3);
  });
});
