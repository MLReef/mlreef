/* eslint-disable no-undef */
import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'babel-polyfill';
import CommitDetails from '../components/commits-details/commitDetails';
import { storeFactory } from '../functions/testUtils';
import { projectsArrayMock, mockMatchDataCommitDet, imagesToRender } from '../testData';

Enzyme.configure({ adapter: new Adapter() });

const setup = () => {
  const store = storeFactory(projectsArrayMock);
  const wrapper = shallow(<CommitDetails store={store} match={mockMatchDataCommitDet} />);
  const afterDiveWrapper = wrapper.dive().dive();
  afterDiveWrapper.setState({ imagesToRender });
  return afterDiveWrapper;
};

describe('images diff', () => {
  test('assert that both images are rendered previous and new ones', () => {
    const wrapper = setup();
    expect(wrapper.find('ImageDiffSection')).toHaveLength(1);
  });
});
