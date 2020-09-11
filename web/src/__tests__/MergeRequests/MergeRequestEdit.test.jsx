import React from 'react';
import { mount } from 'enzyme';
import { MergeRequestEdit } from 'components/layout/MergeRequests';

const title = 'Project Hope';
const description = '';
const onTitleChange = jest.fn();
const onDescriptionChange = jest.fn();

const setup = () => {
  const wrapper = mount(
    <MergeRequestEdit
      title={title}
      description={description}
      onTitleChange={onTitleChange}
      onDescriptionChange={onDescriptionChange}
    />,
  );

  return wrapper;
};

describe('MergeRequestEdit basics', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that contains basic components', () => {
    expect(wrapper.find('MSimpleTabs')).toHaveLength(1);
    expect(wrapper.find('ReactMarkdown')).toHaveLength(1);
  });

  test('assert render fields', () => {
    expect(wrapper.find('#merge-request-edit-title')).toHaveLength(1);
    expect(wrapper.find('#merge-request-edit-description')).toHaveLength(1);
  });
});

describe('MergeRequestEdit functionality', () => {
  let wrapper;
  let inputTitle;
  let inputDesc;

  beforeEach(() => {
    wrapper = setup();
    inputTitle = wrapper.find('#merge-request-edit-title');
    inputDesc = wrapper.find('#merge-request-edit-description');
  });

  test('assert that fields contain initial values', () => {
    expect(inputTitle.instance().value).toBe(title);
    expect(inputDesc.instance().value).toBe(description);
  });

  test('assert that callbacks are called on change', () => {
    inputTitle.simulate('change', { target: { value: 'New title' } });
    expect(onTitleChange).toHaveBeenCalled();

    inputDesc.simulate('change', { target: { value: 'A description.' } });
    expect(onDescriptionChange).toHaveBeenCalled();
  });
});
