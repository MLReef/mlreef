import { generateColor } from 'functions/helpers';

const parseExperiments = (exps) => {
  const expWithMetrics = exps.find((exp) => exp.jsonBlob);
  const jsonBlob = expWithMetrics && JSON.parse(expWithMetrics.jsonBlob);
  const pre = Object.values(jsonBlob || {})[0];
  const metricLabels = Object.keys(pre || {});

  const header = {
    id: 0,
    cols: [
      {
        x: 0,
        y: 0,
        type: 'status',
        value: 'status',
      },
      {
        x: 1,
        y: 0,
        type: 'label',
        value: 'name',
      },
      {
        x: 2,
        y: 0,
        type: 'user',
        value: 'user',
      },
      {
        x: 3,
        y: 0,
        type: 'model',
        value: 'model',
      },
      {
        x: 4,
        y: 0,
        type: 'timestamp',
        value: 'created at',
      },
    ].concat(metricLabels.map((value, i) => ({
      x: 5 + i,
      y: 0,
      type: 'metric',
      value,
    }))),
  };

  const rows = exps.map((exp, i) => {
    const jb = exp.jsonBlob && JSON.parse(exp.jsonBlob);
    const a = Object.values(jb || {});

    const metrics = (a ? Object.entries(a[a.length - 1] || {}) : [])
      .map(([name, value]) => ({ name, value }));

    const cols = [
      {
        x: 0,
        y: 1 + i,
        type: 'status',
        value: exp.status,
      },
      {
        x: 1,
        y: 1 + i,
        type: 'label',
        color: generateColor(i),
        value: exp.name,
      },
      {
        x: 2,
        y: 1 + i,
        type: 'user',
        value: exp.authorName,
      },
      {
        x: 3,
        y: 1 + i,
        type: 'timestamp',
        value: exp.pipelineJobInfo?.createdAt,
      },
      {
        x: 4,
        y: 1 + i,
        type: 'model',
        link: exp.processing?.id,
        value: exp.processing?.name,
      },
    ].concat(metricLabels.map((l, ii) => ({
      x: 5 + ii,
      y: 1 + i,
      type: 'metric',
      value: metrics.find((p) => p.name === l)?.value,
    })));

    return {
      id: i + 1,
      uuid: exp.id,
      cols,
    };
  });

  return [header].concat(rows);
};

export default parseExperiments;
