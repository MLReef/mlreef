import React from 'react';
import { mount } from 'enzyme';
import MTimer from 'components/ui/MTimer/MTimer';

const setup = (timestamp) => mount(
  <MTimer startTime={timestamp} />,
);

test('assert that timer renders', () => {
  const dt = new Date();
  dt.setHours(dt.getHours() - 1);
  const wrapper = setup(dt.toString());
  expect(wrapper.find('p').text().includes('01:00:0')).toBe(true);
});
