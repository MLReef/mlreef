import React from "react";
import folderIcon from './../images/folder_01.svg'
import fileIcon from './../images/file_01.svg'

const FilesContainer = ({files}) => { 
    return (
        <div className="files-container">
            <div class="commit-status">
                <p id="commitStatus">This branch is <b>123 commits</b> ahead and <b>1 commit</b> behind <b>"master".</b>
                </p>
                <button class="create-pr">
                    <p>Create Pull Request</p>
                </button>
            </div>

            <table className="file-properties" cellspacing="0" cellpadding="0" id="file-tree">
                <tr class="title-row">
                    <th><p>Name</p></th>
                    <th><p>Last Commit</p></th>
                    <th><p>Size (Files)</p></th>
                    <th><p>Last Update</p></th>
                </tr>
                {files.map(function(file) {
                    let icon;
                    if (file.type === "tree") {
                        icon = folderIcon;
                    }else{
                        icon = fileIcon;
                    }
                    return (
                        <tr className='files-row'>
                            <td class='file-type'>
                                <img src={icon} alt=""/>
                                {file.name}
                            </td>
                            <td> <p>Something</p> </td>
                            <td> <p>big</p> </td>
                            <td> <p> yesterday </p> </td>
                        </tr>
                    )
                })}
            </table>
        </div>
    );
};

export default FilesContainer;
