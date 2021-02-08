export default {
  dataProcessor: {
    fileName: 'data_processor.py',
    content: 
    `@data_processor(
      name="Resnet 2.0 Filter",
      author="MLReef",
      type="ALGORITHM",
      description="Transforms images with lots of magic",
      visibility="PUBLIC",
      input_type="IMAGE",
      output_type="IMAGE"
    )
    @parameter(name="cropFactor", type="Float", required=True, defaultValue=1)
    @parameter(name="imageFiles", type="List",required=True, defaultValue="[]")
    @parameter(name="optionalFilterParam", type="Integer", required=True, defaultValue=1)
    def myCustomOperationEntrypoint(cropFactor, imageFiles, optionalFilterParam=1):
      print("stuff happening here")
    
    myCustomOperationEntrypoint(epfInputArray)`
  },
  requirementsFile: {
    fileName: 'requirements.txt',
    content: 'python==2.7\n',
  },
};
