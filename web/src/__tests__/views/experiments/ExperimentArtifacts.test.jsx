import React from 'react';
import { mount } from 'enzyme';
import ExperimentArtifacts from 'components/views/ExperimentDetails/MenuOptions/ExperimentArtifacts';
import { jobMock } from 'testData';
import { generatePromiseResponse, sleep } from 'functions/testUtils';

const setup = (status) => mount(
  <ExperimentArtifacts projectId={890890} job={status ? {...jobMock, status } : jobMock} />
);

describe('test experiment rendering uiand functionality', () => {
  let wrapper;

  test('basic rendering for a non-finished correclty job', () => {
    wrapper = setup();
    expect(wrapper.find('p').text()).toBe('No output files available yet. Try again later');
  });

  test('basic rendering for a finished job', () => {
    wrapper = setup('success');
    expect(wrapper.find('tbody').find('tr').at(0).childAt(0).find('p').text()).toBe('job.log');
  });

  test('assert that download button works correctly', async () => {
    let blobMock;
    jest.spyOn(global, 'fetch').mockImplementation(() => {
      blobMock = jest.fn(() => new Promise((resolve) =>  {
        const contentType = 'text/plain';
        const b64Data = 'c29tZSBjb250ZW50';
    
        return resolve(b64toBlob(b64Data, contentType));
      }));
      const jobLogResponse = new Promise((resolve) => resolve({
        ok: true,
        blob: blobMock,
      }));
      return jobLogResponse;
    });
    wrapper = setup('success');
    const buttons = wrapper.find('button');
    expect(buttons.length).toBe(2);
    buttons.at(0).simulate('click');
    await sleep(10);
    expect(blobMock).toHaveBeenCalled();
  });
});
