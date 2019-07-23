import React from "react";
import folderIcon from './../images/folder_01.svg'
import fileIcon from './../images/file_01.svg'
import {Link} from 'react-router-dom';

const FilesContainer = ({branch, files}) => {

    function getReturnOption() {
        if(window.location.href.includes("path")){
            const button = <button onClick={() => {window.history.back()}}>..</button>;
            return <tr className='files-row'>
                <td className='file-type'>
                            <button onClick={() => {window.history.back()}} style={{'padding': '0'}}>
                                <img src={folderIcon} alt=""/>
                            </button>
                        
                            {button}
                        </td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                </tr>
        }
    }

    return (
        <div className="files-container">
            <div className="commit-status">
                <p id="commitStatus">This branch is <b>123 commits</b> ahead and <b>1 commit</b> behind <b>"master".</b>
                </p>
                <button className="create-pr">
                    <p>Create Pull Request</p>
                </button>
            </div>

            <table className="file-properties" cellSpacing="0" cellPadding="0" id="file-tree">
                <thead>
                    <tr className="title-row">
                        <th><p id="paragraphName">Name</p></th>
                        <th><p id="paragraphLastCommit">Last Commit</p></th>
                        {/* <th><p>Size (Files)</p></th> */}
                        <th><p id="paragraphLastUpdate">Last Update</p></th>
                    </tr>
                </thead>
                <tbody>
                {getReturnOption()}
                {files.map(function (file) {
                    let icon;
                    let link;
                    if (file.type === "tree") {
                        icon = folderIcon;
                        link = `/files/branch/${branch}/path/${file.name}`;
                    } else {
                        icon = fileIcon;
                        link = `/files/branch/${branch}/file-name/${file.name}`;
                    }
                    return (
                        <tr className='files-row'>
                            <td className='file-type'>
                                <Link to={link}>
                                    <img src={icon} alt=""/>
                                </Link>
                                <Link to={link}>{file.name}</Link>
                            </td>
                            <td><p>Something</p></td>
                            {/* <td> <p>big</p> </td> */}
                            <td><p> yesterday </p></td>
                        </tr>
                    )
                })}
                </tbody>
            </table>
        </div>
    );
};

export default FilesContainer;
