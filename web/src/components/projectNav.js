import React from 'react';
import { Link } from "react-router-dom";

const ProjectNav = (params) => {
    return (
        <div class="project-nav">
        {
            params.folders.map((folder) => {
                if(params.folders.indexOf(folder) === (params.folders.length - 1)){
                    if(folder === 'Data'){
                        return <Link to="/home"> <p> &nbsp; {folder} &nbsp;</p></Link>;
                    } else {
                        return <p>&nbsp;{folder}&nbsp;</p>
                    }
                } else {
                    if(folder === 'Data'){
                        return <Link to="/home"> <p> &nbsp; {folder} &nbsp;> &nbsp;</p></Link>;
                    } else {
                        return <p> &nbsp;{folder}&nbsp;>&nbsp;</p>
                    }            
                }
            })
        }
        </div>    
    )
}

export default ProjectNav;