import { parseLine } from 'components/views/ExperimentDetails/actions';
import experimentActions from 'components/experiments-overview/ExperimentActions';
import { backendExperiments, jobLogMock } from 'testData';

describe('test functions', () => {
  beforeEach(() => {
    experimentActions
      .expApi
      .getExperiments = jest.fn(() => new Promise((resolve) => resolve(backendExperiments)));
  });
  test('assert that experiments are parsed', async () => {
    const result = await experimentActions.getExperiments(1);
    const classExp = result[0];
    expect(!classExp.pipelineJobInfo).toBe(false);
    const {
      id,
      ref,
      commitSha,
      createdAt,
      updatedAt,
    } = classExp.pipelineJobInfo;
    expect(!classExp.pipelineJobInfo).toBe(false);
    expect(id).toBe(231);
    expect(ref).toBe('experiment/powerful-krill_6112020');
    expect(commitSha).toBe('9d2816464e6f1eb5ab42830c02c39ec6c7de67ba');
    expect(createdAt).toBe('2020-11-06T15:03:47.796Z');
    expect(updatedAt).toBe('2020-11-06T15:03:47.919Z');
  });
});

const lines = jobLogMock.split('\n');

describe('test secondary functions', () => {
  test('assert that parse line works correctly', () => {
    lines.map((l) => {
      const parsedLine = parseLine(l);
      expect(parsedLine.classList).toBeDefined();
      expect(parsedLine.finalLine).toBeDefined();

      if (l.includes('[31;1m')) {
        expect(parsedLine.classList.includes('t-danger t-bold')).toBe(true);
      }
    });
  });
});
