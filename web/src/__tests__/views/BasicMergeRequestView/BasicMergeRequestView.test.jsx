// These tests are not currently possible because they crash trying to import monaco.
// Therefore they are skipped and will be finished once monaco error gets fixed.
import React from 'react';
// import BasicMergeRequestView from 'components/mergeRequestDetailView/basicMergeRequestView';
import { shallow } from 'enzyme';

import { storeFactory } from 'functions/testUtils';

const location = {

};

// prov
const BasicMergeRequestView = () => null;

const mergeRequestDetails = {
  id: 1,
  iid: 1,
  project_id: 6,
  title: 'Merge file to main branch',
  state: 'opened',
  source_branch: 'social-moby-dick_3172020',
  target_branch: 'master',
  created_at: '2020-07-31T17:48:46.741Z',
  updated_at: '2020-08-03T16:18:05.038Z',
  has_conflicts: false,
  force_remove_source_branch: null,
  should_remove_source_branch: null,
  merged_by: null,
  merged_at: null,
  closed_by: null,
  closed_at: null,
  author: {
    name: 'my-username',
    avatar_url: '',
  },
};

const openedMergeRequest = storeFactory({
  mergeRequests: {
    list: [],
    current: mergeRequestDetails,
  },
});

const closedMergeRequest = storeFactory({
  mergeRequests: {
    list: [],
    current: {
      ...mergeRequestDetails,
      state: 'closed',
      closed_by: {
        name: 'my-username',
        avatar_url: '',
      },
    },
  },
});

const mergedMergeRequest = storeFactory({
  mergeRequests: {
    list: [],
    current: {
      ...mergeRequestDetails,
      state: 'merged',
      merged_at: {
        name: 'my-username',
        avatar_url: '',
      },
    },
  },
});

describe('basic elements', () => {
  test.skip('If opened should show Edit and Close buttons', () => {
    const wrapper = shallow(
      <BasicMergeRequestView
        store={openedMergeRequest}
        location={location}
      />,
    );
  });

  test.skip('If closed should show Reopen button', () => {
    const wrapper = shallow(
      <BasicMergeRequestView
        store={closedMergeRequest}
        location={location}
      />,
    );
  });

  test.skip('If Merged should show Revert button', () => {
    const wrapper = shallow(
      <BasicMergeRequestView
        store={mergedMergeRequest}
        location={location}
      />,
    );
  });
});
