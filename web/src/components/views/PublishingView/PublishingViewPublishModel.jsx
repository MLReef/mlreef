import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MVerticalSteps from 'components/ui/MVerticalSteps';
import MCheckBoxGroup from 'components/ui/MCheckBoxGroup';
import { modelOptions, categoryOptions } from './info2';

const PublishingViewPublishModel = (props) => {
  const {
    className,
  } = props;

  const [model, setModel] = useState(1);
  const [category, setCategory] = useState(2);

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
                  Selected entry point: <span>File_01.py</span>
                </p>
                <p>
                  Selected branch: <span>Master</span>
                </p>
              </div>
            ),
          },
          {
            label: 'Environment',
            done: false,
            content: (
              <div>
                Selected environment: <span>GPU - TF</span>
              </div>
            ),
          },
          {
            label: 'Requirements.txt',
            done: false,
            content: (
              <div>
                <p>
                  Make sure that you have placed an environment.txt file in your
                  repository. This will ensure that all required packages for
                  your model are installed properly during the publishing process.
                </p>
                <p>
                  Read more about the <a href="/">publishing process</a> in our docs.
                </p>
              </div>
            ),
          },
          {
            label: 'Model type',
            done: false,
            content: (
              <div>
                <p className="t-secondary mt-0">
                  Select 1 model type that fits best your ML model. This information
                  will be used for better discoverability.
                </p>
                <MCheckBoxGroup
                  name="model"
                  options={modelOptions}
                  value={model}
                  onSelect={setModel}
                />
              </div>
            ),
          },
          {
            label: 'ML category',
            done: false,
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
                  onSelect={setCategory}
                />
              </div>
            ),
          },
          {
            label: 'Accept Publishing Terms',
            done: false,
            content: (
              <div>
                <p>
                  In short, by agreeing to the <a href="/">Repository Producer Terms</a> you
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
                <p>
                  I hereby accept the Repository Producer Terms.
                </p>
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
};

PublishingViewPublishModel.propTypes = {
  className: PropTypes.string,
};

export default PublishingViewPublishModel;
