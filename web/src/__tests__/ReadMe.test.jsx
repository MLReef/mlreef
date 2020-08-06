import React from 'react';
import renderer from 'react-test-renderer';
import Readme from 'components/ReadMe/ReadMe';

const props = {
  projectId: 11,
  branch: 'master',
};

describe('render basic readme elements', () => {
  test('assert that snapshot matches', () => {
    const snapShot = renderer.create(<Readme props={props} />).toJSON();
    expect(snapShot).toMatchSnapshot();
  });
});
