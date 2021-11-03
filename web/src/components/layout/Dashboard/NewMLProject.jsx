import React from 'react'
import useHistory from 'router/useHistory'

const NewMLProject = () => {
	const history = useHistory();
	const handleGoToNewMlProject = () => {
			history.push("/new-project/classification/ml-project");
	}
	return (
		<div className="dashboard-v2-content-search-bar-dropdown">
			<button
					type="button"
					className="new-project btn-primary"
					onClick={handleGoToNewMlProject}
			>
					New ML Project
					{' '}
			</button>
		</div>
	)
}
export default NewMLProject;
