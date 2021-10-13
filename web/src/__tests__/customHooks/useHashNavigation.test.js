import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { storeFactory } from 'functions/testUtils';
import { testHookWithRoute } from 'setupTests';
import useHashNavigation from 'customHooks/useHashNavigation';

let onSelect;
let location;
let setTarget;

beforeEach(() => {
  const store = storeFactory({

  });

  testHookWithRoute(
    () => {
      [, setTarget] = useState();
      location = useLocation();
      onSelect = useHashNavigation(setTarget);
    },
    {
      store,
      url: '/explore/#Algorithm',
    },
  );
});

describe('test useHashNavigation functionality', () => {
  test('assert onSelect changes the url', () => {
    const targetTab = 'target-tab';
    onSelect(targetTab);

    expect(location.hash).toBe(`#${targetTab}`);
  });
});
