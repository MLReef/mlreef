import React from 'react';
import { Link } from "react-router-dom";

const ProjectNav = (params) => {
    return (
        <div className="project-nav">
            {params.folders.map((folder, index) => 
                (index === (params.folders.length - 1)) 
                    ? folder === 'Data' 
                        ? <Link key={`project-nav-link-${index}`} to={`/my-projects/${params.projectId}`}> <p> &nbsp; {folder} &nbsp;</p></Link>
                        : <p key={`project-nav-paragraph-${index}`}>&nbsp;{folder}&nbsp;</p>
                    : folder === 'Data'
                        ? <Link to={`/my-projects/${params.projectId}`}> <p key={`project-nav-link-${index}`}> &nbsp; {folder} &nbsp;> &nbsp;</p></Link>
                        : <p key={`project-nav-paragraph-${index}`}> &nbsp;{folder}&nbsp;>&nbsp;</p>
            )}
        </div>    
    )
}

export default ProjectNav;