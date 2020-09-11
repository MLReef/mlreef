import React from 'react';
import { mount } from 'enzyme';
import { MergeRequestEditWithActions } from 'components/layout/MergeRequests';

const title = 'Project Hope';
const description = '';
const onCancel = jest.fn();
const onSave = jest.fn();

const setup = () => {
  const wrapper = mount(
    <MergeRequestEditWithActions
      title={title}
      description={description}
      onCancel={onCancel}
      onSave={onSave}
    />,
  );

  return wrapper;
};

describe('MergeRequestEditWithActions basics', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that contains basic components', () => {
    expect(wrapper.find('MergeRequestEdit')).toHaveLength(1);
    expect(wrapper.find('MButton')).toHaveLength(1);
  });
});

describe('MergeRequestEditWithActions functionality', () => {
  let wrapper;
  let inputTitle;
  let inputDesc;

  beforeEach(() => {
    wrapper = setup();
    inputTitle = wrapper.find('#merge-request-edit-title');
    inputDesc = wrapper.find('#merge-request-edit-description');
  });

  test('assert that buttons are connected', () => {
    const cancelBtn = wrapper.find('button.btn-basic-dark');
    const saveBtn = wrapper.find('button.btn-primary');

    saveBtn.simulate('click');
    expect(onSave).toHaveBeenCalledWith({ title, description });

    cancelBtn.simulate('click');
    expect(onCancel).toHaveBeenCalled();
  });

  test('assert that fields contain initial values', () => {
    expect(inputTitle.instance().value).toBe(title);
    expect(inputDesc.instance().value).toBe(description);
  });

  test('assert that new values are sent on save', () => {
    const newTitle = 'New title';
    const newDesc = 'A new Awesome description.';

    inputTitle.simulate('change', { target: { value: newTitle } });
    inputDesc.simulate('change', { target: { value: newDesc } });
    wrapper.find('button.btn-primary').simulate('click');

    expect(onSave).toHaveBeenCalledWith({ title: newTitle, description: newDesc });
  });
});
