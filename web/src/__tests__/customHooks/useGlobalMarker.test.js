import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { storeFactory } from 'functions/testUtils';
import { testHook } from 'setupTests';
import useGlobalMarker from 'customHooks/useGlobalMarker';

let onSelect;
let location;
let setTarget;
let color;
let isLoading;
let setColor;
let setIsLoading;

beforeEach(() => {
  const store = storeFactory({
    globalMarker: {
      color: 'red',
      isLoading: false,
    },
  });

  testHook(
    () => {
      [{ color, isLoading }, { setColor, setIsLoading }] = useGlobalMarker();
    },
    { store },
  );
});

describe('test useGlobalMarker functionality', () => {
  test('assert the initial state', () => {
    expect(color).toBe('red');
    expect(isLoading).toBe(false);
  });

  test('assert it does change color', () => {
    expect(color).toBe('red');
    setColor('blue');
    expect(color).toBe('blue');
  });

  test('assert it does change isLoading', () => {
    setIsLoading(true);
    expect(isLoading).toBe(true);

    setIsLoading(false);
    expect(isLoading).toBe(false);
  });
});
