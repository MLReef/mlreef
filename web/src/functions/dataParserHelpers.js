import filesApi from "../apis/FilesApi";

export const getTimeCreatedAgo = (timeAgoCreatedAt) => {
    const today = new Date();
    const timeAgoCreatedAtDate = new Date(timeAgoCreatedAt);
    let diff = today - timeAgoCreatedAtDate;
    let timediff;
    if (diff > 2678400e3) {
        timediff = `${Math.floor(diff / 2678400e3)} months`
    }
    else if (diff > 604800e3) {
        timediff = `${Math.floor(diff / 604800e3)} weeks`
    }
    else if (diff > 86400e3) {
        timediff = `${Math.floor(diff / 86400e3)} days`
    }
    else if (diff > 3600e3) {
        timediff = `${Math.floor(diff / 3600e3)} hour(s)`
    }
    else if (diff > 60e3) {
        timediff = `${Math.floor(diff / 60e3)} minutes`
    }
    else {
        timediff = "just now"
    }

    return timediff;
}

export const generateSummarizedInfo = (epochObjects) => {
    /**
     * Next loop is to get all the epoc keys like acc, val_acc, loss, val_loss.
     */
    const resultData = Object.keys(epochObjects[0]).map( key => {
        const pipeLineEpochValue = {};
        pipeLineEpochValue[key] = [];

        return pipeLineEpochValue;
    });

    Object.keys(epochObjects).forEach(obj => {
        Object.keys(epochObjects[obj]).forEach((objKey, index) => {
            resultData[index][objKey].push(epochObjects[obj][objKey]);
        });
    });

    /**
     * Get average data per epoch value
     */
    resultData.forEach((epochValue) => {
        const epochNameValue = Object.keys(epochValue)[0];
        resultData[`avg_${epochNameValue}`] = (
            epochValue[epochNameValue]
                .reduce((a, b) => a + b)
                    / epochValue[epochNameValue].length
        );
    })
    return resultData;
}

/**
   * @param {fileToTest} file to be checked if should be displayed,
   * as some files belong to subfolders they should not be displayed in table
*/   
export const findFolderContainer = (fileToTest, files) =>
    files
    .filter(file => file.type === "tree")
    .filter(
        folderFile => fileToTest.path.includes(folderFile.path) 
        && folderFile.id !== fileToTest.id // this is to avoid a folder crash against itself
    )

export const generateNewArrayOfFilesToRender = async ( filesResponse, projectId, branch ) => {
    const files = filesResponse.filter(file => file.type === "blob");
    const folders = filesResponse.filter(file => file.type === "tree");
    const filesData = await Promise.all(files.map(file =>
        filesApi.getFileData(
          "gitlab.com", 
          projectId,
          file.path.replace(/\//g, "%2F"),
          branch
        )
    ));

    const updatedFiles = assignSizeToFiles(files, filesData);
    const updatedFolders = updatedFiles.length === 0 
      ? folders
      : assignSizeToFiles(folders, [], updatedFiles);

    return [...updatedFolders, ...updatedFiles]
}

export const assignSizeToFiles = (files, filesData, updatedFiles) => files.map((file) => {
    const newFile = file;
    newFile["size"] = file.type === "blob"
      ? calculateSize(
          filesData.filter(
            fD => fD.blob_id === file.id
          )[0].size, 
          file,
          files
        )
      : calculateSize(null, file, updatedFiles);
  
    return newFile;
});

export const calculateSize = (size, file, fullArrayOfFiles) => {
    if(file.type === "blob") {
      return Math.floor(size / 1000);
    } else {
      const filesInFolder = getFilesInFolder(file, fullArrayOfFiles)
       .map(file => file.size)
       .filter(size => size !== undefined);

      return filesInFolder.length > 0
        ? filesInFolder.reduce((a, b) => a + b)
        : 0;
    }
  }

export const getFilesInFolder = (folder, files) => 
  files.filter(
      file => file.path.includes(folder.name) 
        && file.id !== folder.id
    )

export const getParamFromUrl = (
    param, 
    url
) => new URL(url).searchParams.get(param);