import React from 'react';
import { mount } from 'enzyme';
import Readme from 'components/ui/ReadMe/ReadMe';
import { generatePromiseResponse, sleep } from 'functions/testUtils';

const base64ReadmeContent = 'IyBTaWduIExhbmd1YWdlIENsYXNzaWZpZXIgUmVwbwoKRGVzY3JpcHRpb24KCgpqYWphamFqYQoKCmpqYWphamFhamEgMg==';

const setup = () => mount(
  <Readme
    projectId={1}
    branch="master"
  />,
);

describe('render basic readme elements', () => {
  let wrapper;
  beforeEach(() => {
    jest.spyOn(global, 'fetch')
      .mockImplementation(() => generatePromiseResponse(
        200,
        true,
        { content: base64ReadmeContent },
        50,
      ));
    wrapper = setup();
  });
  test('assert that snapshot matches', async () => {
    await sleep(200);
    wrapper.setProps({});
    const markDownRenderer = wrapper.find('ReactMarkdownWithHtml');
    expect(markDownRenderer.find('h1').childAt(0).text()).toBe('Sign Language Classifier Repo');

    const textRenderers = markDownRenderer.find('TextRenderer');
    expect(textRenderers.at(1).text()).toBe('Description');
    expect(textRenderers.at(2).text()).toBe('jajajaja');
  });
});
