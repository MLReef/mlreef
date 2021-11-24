import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import CreateProject from '../components/views/CreateProject/createProject';
import { generatePromiseResponse, sleep, storeFactory } from '../functions/testUtils';
import { projectsArrayMock, branchesMock, groupsMock } from '../testData';


const setup = () => {
  jest.spyOn(global, 'fetch').mockImplementation((req) => {
    if(req.url.includes('/api/v1/project-names/is-available')) {
      return generatePromiseResponse(200, true, { slug:	"jajaja-project" }, 15);
    }
    return generatePromiseResponse(200, true, [{"id":263,"web_url":"http://gitlab.review-master-8dyme2.35.246.253.255.nip.io/groups/jaja-group","name":"jaja group","path":"jaja-group","description":"","visibility":"private","share_with_group_lock":false,"require_two_factor_authentication":false,"two_factor_grace_period":48,"project_creation_level":"developer","auto_devops_enabled":null,"subgroup_creation_level":"maintainer","emails_disabled":null,"mentions_disabled":null,"lfs_enabled":true,"avatar_url":null,"request_access_enabled":true,"full_name":"jaja group","full_path":"jaja-group","parent_id":null}], 15);
  });
  const store = storeFactory({
    projects: projectsArrayMock.projects,
    groups: groupsMock,
    branches: branchesMock.map((branch) => branch.name),
    users: projectsArrayMock.users,
    user: {
      username: 'nickname',
      id: 'uuid',
    },
  });
  const history = {
    goBack: jest.fn,
  };

  const wrapper = mount(
    <Provider store={store}>
      <MemoryRouter>
        <CreateProject history={history} />
      </MemoryRouter>
    </Provider>
  );
  return wrapper;
};

describe('test the frontend features', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that new project view contains basic components', () => {
    expect(wrapper.find('MInput#projectTitle')).toHaveLength(1);
    expect(wrapper.find('#nameSpace')).toHaveLength(1);
    expect(wrapper.find('#projectSlug')).toHaveLength(1);
    expect(wrapper.find('#projectDescription')).toHaveLength(1);
    expect(wrapper.find('MCheckBox')).toHaveLength(10);
    expect(wrapper.find('.btn.btn-basic-dark')).toHaveLength(1);
    expect(wrapper.find('MButton.btn.btn-primary')).toHaveLength(1);
  });
});

describe('test the frontend functionality', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that minimum valid form works', async () => {
    expect(wrapper.find('MButton.btn.btn-primary').props().disabled).toBeTruthy();
    const mockProjectName = 'new-project-name';
    const projectNameInput = wrapper.find('MInput#projectTitle').find('input');
    const mockEvent = {
      target: {
        value: mockProjectName,
      },
    };
    projectNameInput.simulate('change', mockEvent);
    expect(wrapper.find('CreateProject').state().projectName).toBe(mockProjectName);
    projectNameInput.simulate('blur');

    await sleep(20);
    expect(global.fetch).toHaveBeenCalled();
    wrapper.find('MCheckBox').at(0).find('div').simulate('click', {});

    const submitButton = wrapper.find('MButton.btn.btn-primary');
    expect(submitButton.props().disabled).toBe(false);

    submitButton.find('button').simulate('click');
    await sleep(20);
    const submitCall = global.fetch.mock.calls[4][0];
    expect(submitCall.url).toBe('/api/v1/data-projects');
    expect(submitCall.method).toBe('POST');
    
    expect(submitCall._bodyInit)
      .toBe('{"name":"new-project-name","slug":"jajaja-project","namespace":"nickname","initialize_with_readme":false,"description":"","visibility":"public","input_data_types":["TEXT"]}');
  });

  test('assert that data types are added to state when selected', () => {
    expect(wrapper.find('MCheckBox').length).toBeGreaterThan(0);
    wrapper.find('MCheckBox').forEach((comp) => {
      comp.find('div').simulate('click', {});
    });
    expect(wrapper.find('CreateProject').state().dataTypesSelected.length).toBe(4);
  });

  // MLreef currently does not support groups, TODO: enable when we do it
  /* test('assert that public project option is disabled for private groups', () => {
    const { full_path: fPath } = groupsMock[1];
    wrapper.find('#nameSpace').simulate('change', { target: { value: fPath } });
    expect(wrapper.find('CreateProject').state().nameSpace).toBe(fPath);
    expect(
      wrapper
        .find('MRadioGroup')
        .find('MRadio')
        .at(1)
        .props()
        .disabled,
    ).toBe(true);
  }); */
});
