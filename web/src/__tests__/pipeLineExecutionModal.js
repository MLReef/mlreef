import React from 'react';
import { ExecutePipeLineModal } from "./../components/pipeline-view/executePipeLineModal";
import {cleanup, render} from '@testing-library/react';

// automatically unmount and cleanup DOM after the test is finished.
afterEach(cleanup);

test('DataOperationsList', () => {
  const {queryByText} = render(
    <ExecutePipeLineModal isShowing={true} toggle={() => {console.log("toggle")}} amountFilesSelected={3}/>
  );
  expect(queryByText(/3/i)).toBeInTheDocument();
});  
