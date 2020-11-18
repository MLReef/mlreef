import actionsAndFunctions from 'components/views/Publications/PublicationActionsAndFunctions';
import { CANCELED, FAILED, PENDING, RUNNING, SUCCESS } from 'dataTypes';
import { mockedPipelines } from 'testData';

test('assert that pipes are sorted correctly', () => {
  const sortedPipes = actionsAndFunctions.sortPipelines(mockedPipelines);

  expect(sortedPipes.length).toBe(4);
  expect(sortedPipes[0].status).toBe(PENDING);
  expect(sortedPipes[1].status).toBe(RUNNING);
  expect(sortedPipes[2].status).toBe(FAILED);
  expect(sortedPipes[3].status).toBe('finished');
  // check items in the classifications
  expect(sortedPipes[0].items).toHaveLength(0);
  expect(sortedPipes[1].items).toHaveLength(0);
  expect(sortedPipes[2].items).toHaveLength(0);
  expect(sortedPipes[3].items).toHaveLength(4);
});

test('assert that color is mapped correctly', () => {
  expect(actionsAndFunctions.getColor(PENDING)).toBe('var(--warning)');
  expect(actionsAndFunctions.getColor(RUNNING)).toBe('var(--success)');
  expect(actionsAndFunctions.getColor(SUCCESS)).toBe('var(--success)');
  expect(actionsAndFunctions.getColor(CANCELED)).toBe('var(--dark)');
  expect(actionsAndFunctions.getColor(FAILED)).toBe('var(--danger)');
  expect(actionsAndFunctions.getColor('RANDOM_STATUS')).toBe('var(--info)');
});
