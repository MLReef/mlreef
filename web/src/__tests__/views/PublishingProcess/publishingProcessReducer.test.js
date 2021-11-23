import { categoryOptions, environments, modelOptions } from 'components/views/PublishingView/info2';
import initialState, { reducer } from 'components/views/PublishingView/stateManagement';
import { filesMock } from 'testData';

test('assert reducer returns the correct results', () => {
  const newBranch = 'some-new-branch';
  const result = reducer(
    initialState, {
      type: 'SET_SELECTED_BRANCH',
      payload: newBranch,
    },
  );
  const { selectedBranch } = result;
  expect(selectedBranch).toBe(newBranch);
});

test('assert that reducer updates files arr', () => {
  const newFilesArr = filesMock;
  const result = reducer(
    initialState, {
      type: 'SET_FILES',
      payload: newFilesArr,
    },
  );
  const { files } = result;
  expect(files).toBe(newFilesArr);
});

test('assert that reducer updated entry point', () => {
  const newEntryPoint = filesMock[0];
  const result = reducer(
    initialState, {
      type: 'SET_ENTRY_POINT',
      payload: newEntryPoint,
    },
  );
  const { entryPointFile } = result;
  expect(entryPointFile).toBe(newEntryPoint);
});

test('assert that reducer updated env and removes it when user picks the same one', () => {
  const newSelectedEnv = environments[0];
  const result = reducer(
    initialState, {
      type: 'SET_ENVIRONMENT',
      payload: newSelectedEnv,
    },
  );
  const { selectedEnv } = result;
  expect(selectedEnv).toBe(newSelectedEnv);

  const result1 = reducer(
    { ...initialState, selectedEnv: newSelectedEnv }, {
      type: 'SET_ENVIRONMENT',
      payload: newSelectedEnv,
    },
  );
  const { selectedEnv: selectedEnvNull } = result1;
  expect(selectedEnvNull).toBe(null);
});

test('assert that boolean "is requirements present" is set corretly', () => {
  const result = reducer(
    initialState, {
      type: 'SET_REQUIREMENTS_FILE',
      payload: {
        id: 'd564d0bc3dd917926892c55e3706cc116d5b165w',
        name: 'Requirements.txt',
        type: 'blob',
        path: 'Requirements.txt',
        mode: '040000',
      },
    },
  );
  const { requirementsFile } = result;
  expect(requirementsFile).not.toBeNull();
});

test('assert that reducer updates model and removes it when user picks the same one', () => {
  const newModel = modelOptions[0];
  const result = reducer(
    initialState, {
      type: 'SET_MODEL',
      payload: newModel,
    },
  );
  const { model } = result;
  expect(model).toBe(newModel);

  const result1 = reducer(
    { ...initialState, model: newModel }, {
      type: 'SET_MODEL',
      payload: newModel,
    },
  );
  const { model: modelNull } = result1;
  expect(modelNull).toBe(null);
});

test('assert that reducer updates category and removes it when user picks the same one', () => {
  const newMlCategory = categoryOptions[0];
  const result = reducer(
    initialState, {
      type: 'SET_ML_CATEGORY',
      payload: newMlCategory,
    },
  );
  const { mlCategory } = result;
  expect(mlCategory).toBe(newMlCategory);

  const result1 = reducer(
    { ...initialState, mlCategory: newMlCategory }, {
      type: 'SET_ML_CATEGORY',
      payload: newMlCategory,
    },
  );
  const { mlCategory: mlCategoryNull } = result1;
  expect(mlCategoryNull).toBe(null);
});

test('assert that terms acceptance are changed', () => {
  const result = reducer(
    initialState, {
      type: 'SET_TERMS_ACCEPTED',
      payload: true,
    },
  );
  const { areTermsAccepted } = result;
  expect(typeof areTermsAccepted).toBe('string');
});
