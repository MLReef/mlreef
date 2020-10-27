import React from 'react';
import {
  bool, func, number, shape, string,
} from 'prop-types';
import MCheckBox from 'components/ui/MCheckBox/MCheckBox';
import MVerticalSteps from 'components/ui/MVerticalSteps';
import MCheckBoxGroup from 'components/ui/MCheckBoxGroup';
import { modelOptions, categoryOptions } from './info2';

const PublishingViewPublishModel = (props) => {
  const {
    entryPointFile,
    selectedBranch,
    selectedEnvironment,
    model,
    category,
    isRequirementsFileExisting,
    className,
    areTermsAccepted,
    dispatch,
  } = props;

  return (
    <div className={`mx-5 ${className}`}>
      <MVerticalSteps
        steps={[
          {
            label: 'Entry point & branch',
            done: true,
            content: (
              <div>
                <p>
                  Selected entry point:
                  {' '}
                  <span>{entryPointFile?.name}</span>
                </p>
                <p>
                  Selected branch:
                  {' '}
                  <span>{selectedBranch}</span>
                </p>
              </div>
            ),
          },
          {
            label: 'Environment',
            done: true,
            content: (
              <div>
                Selected environment:
                {' '}
                <span>{selectedEnvironment}</span>
              </div>
            ),
          },
          {
            label: 'Requirements.txt',
            done: isRequirementsFileExisting,
            content: (
              <div>
                <p>
                  Make sure that you have placed an Requirements.txt file in your
                  repository. This will ensure that all required packages for
                  your model are installed properly during the publishing process.
                </p>
                <p>
                  Read more about the
                  {' '}
                  <a href="/">publishing process</a>
                  {' '}
                  in our docs.
                </p>
              </div>
            ),
          },
          {
            label: 'Model type',
            done: !!model,
            content: (
              <div>
                <p className="t-secondary mt-0">
                  Select 1 model type that fits best your ML model. This information
                  will be used for better discoverability.
                </p>
                <MCheckBoxGroup
                  name="model"
                  options={modelOptions}
                  value={modelOptions.indexOf(model) + 1}
                  onSelect={(params) => {
                    const modelObject = modelOptions[params - 1];
                    dispatch({ type: 'SET_MODEL', payload: modelObject });
                  }}
                />
              </div>
            ),
          },
          {
            label: 'ML category',
            done: !!category,
            content: (
              <div>
                <p className="t-secondary">
                  Select 1 ML category that fits best your ML model. This information
                  will be used for better discoverability.
                </p>
                <MCheckBoxGroup
                  options={categoryOptions}
                  name="category"
                  value={category}
                  onSelect={(cat) => {
                    dispatch({ type: 'SET_ML_CATEGORY', payload: cat });
                  }}
                />
              </div>
            ),
          },
          {
            label: 'Accept Publishing Terms',
            done: areTermsAccepted,
            content: (
              <div>
                <p>
                  In short, by agreeing to the
                  {' '}
                  <a href="/">Repository Producer Terms</a>
                  {' '}
                  you
                  grant MLReef the following rights:
                </p>
                <p>
                  You take responsibility for your submission.
                </p>
                <p>
                  You grant MLReef a royalty-free, perpetual, irrevocable, worldwide,
                  non-exclusive and fully sub-licensable right and license under your
                  intellectual property rights to reproduce, publish, distribute, perform
                  and display your Submissions (in whole or in part) solely for the
                  purpose of copying, storing and hosting them for download by users of
                  the Central Repository, all subject to the obligation to retain any
                  copyright notices included in your Submissions and to only make such
                  Submissions available to users under the license you have indicated at
                  the time of submission.
                </p>
                <div className="d-flex" style={{ alignItems: 'center' }}>
                  <MCheckBox
                    name="acceptance-termns-checkbox"
                    labelValue="I hereby accept the Repository Producer Terms."
                    callback={(...params) => dispatch({ type: 'SET_TERMS_ACCEPTED', payload: params[2] })}
                  />
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

PublishingViewPublishModel.defaultProps = {
  className: '',
  entryPointFile: null,
  selectedEnvironment: null,
  model: null,
  category: null,
  areTermsAccepted: false,
};

PublishingViewPublishModel.propTypes = {
  className: string,
  entryPointFile: shape({}),
  selectedBranch: string.isRequired,
  selectedEnvironment: string,
  model: shape({}),
  category: number,
  isRequirementsFileExisting: bool.isRequired,
  areTermsAccepted: bool,
  dispatch: func.isRequired,
};

export default PublishingViewPublishModel;
