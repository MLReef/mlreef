export default {
  dataProcessor: {
    fileName: 'data_processor.py',
    content: 
    `
    # These are the annotations required for running your scripts in MLReef.
    # Add this section below with by adding at leaset the @parameter for input-path and output-path.
    # You can add any other parameter you specified in your script using CLI arguments. 

    def data_processor(*args, **kwargs):
      pass
      return data_processor

    def parameter(*args, **kwargs):
      pass
      return parameter
    
    @data_processor(
      name="Set a name here...",
    )
    @parameter(name="input-path", type="str", required=True, defaultValue="train", description="Data input, path to the images used for augmentation")
    @parameter(name="output-path", type="str", required=True, defaultValue="output", description="Output path to save models and logs")

    def init_params():
    pass

    `
  },
  requirementsFile: {
    fileName: 'requirements.txt',
    content: '# Add any PIP installable libraries here, for example:\nscipy==1.4.1',
  },
};
