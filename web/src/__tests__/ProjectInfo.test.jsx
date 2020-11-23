import React from 'react';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import {
  projectsArrayMock, usersArrayMock,
} from 'testData';
import { storeFactory } from 'functions/testUtils';
import ProjectInfo from 'components/ProjectTitleNActions';

const initialState = {
  projects: projectsArrayMock.projects,
  user: usersArrayMock[0],
};

const setup = () => {
  const store = storeFactory(initialState);
  const wrapper = mount(
    <Provider store={store}>
      <MemoryRouter>
        <ProjectInfo userGid={2} />
      </MemoryRouter>
    </Provider>,
  );

  return wrapper;
};

describe('test comp renders', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that star button react and the right icon is shown initially', () => {
    expect(wrapper.find('#star-icon').props().src).toBe('/images/stared.png');
    wrapper.find('button#star-btn').simulate('click');
    expect(wrapper.find('div.m-loading-spinner')).toHaveLength(1);
  });
});
