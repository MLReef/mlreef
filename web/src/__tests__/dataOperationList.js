import '@testing-library/jest-dom/extend-expect';

import React from 'react';
import {cleanup, render} from '@testing-library/react';
import { DataOperationsList } from "../components/pipeline-view/data-operations-list";
import { INT, FLOAT, BOOL } from "../data-types";

// automatically unmount and cleanup DOM after the test is finished.
afterEach(cleanup);

test('DataOperationsList', () => {
  const {queryByText} = render(
    <DataOperationsList 
      handleDragStart={() => { console.log("handleDragStart")} } 
      whenDataCardArrowButtonIsPressed={()=>{ console.log("whenDataCardArrowButtonIsPressed") }}
      dataOperations={[
        {title: "Augment", username: "UserName 1", starCount: "243", index: 1, 
            description: "Some short description of the data operation to see what it does",
            showDescription:false, showAdvancedOptsDivDataPipeline: false, dataType: "Images", 
            params: {
                standard: [{name: "Number of augmented images", dataType: INT, required: true}],
                advanced: [
                    {name: "Rotation range", dataType: FLOAT, required: false},
                    {name: "Width shift range", dataType: FLOAT, required: false},
                    {name: "Height shift range", dataType: FLOAT, required: false},
                    {name: "Shear range", dataType: FLOAT, required: false},
                    {name: "Zoom range", dataType: FLOAT, required: false},
                    {name: "Horizontal flip", dataType: BOOL, required: false},
                ]
            }
        },
        {title: "Random crop", username: "UserName 2", starCount: "201", index: 2, 
            description: "Some short description of the data operation to see what it does",
            showDescription:false, showAdvancedOptsDivDataPipeline: false, dataType: "Text", 
            params: {
               standard: [
                    {name: "Height", dataType: INT, required: true},
                    {name: "Width", dataType: INT, required: true},
                    {name: "Channels", dataType: INT, required: true},
               ],
               advanced: [
                   {name: "Seed", dataType: INT, required: false}
               ]
            }
        },
        {title: "Random rotate", username: "UserName 3", starCount: "170", index: 3, 
            description: "Some short description of the data operation to see what it does",
            showDescription:false, showAdvancedOptsDivDataPipeline: false, dataType: "Something Else", 
            params: {
                standard: [
                    {name: "Angle of rotation", dataType: FLOAT, required: true}
                ]
            }
        }
      ]}
    />
  );

  expect(queryByText(/Augment/i)).toBeInTheDocument();
  expect(queryByText(/Random crop/i)).toBeInTheDocument();
  expect(queryByText(/Random rotate/i)).toBeInTheDocument();

});