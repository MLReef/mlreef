AuthWrapper
===

Examples
---

* The simplest AuthWrapper implementation, min developer role required.

web/src/components/FilesContainer/FilesContainer.jsx#136
```html
  <AuthWrapper minRole={30}>
    <Link
      type="button"
      className="btn btn-basic-dark"
      to={`/my-projects/${projectId}/${currentBranch}/new-merge-request`}
    >
      Create merge request
    </Link>
  </AuthWrapper>
```

* AuthWrapper applied in a button inside a buttons group, if no owner no render,
also there is a feature class.

web/src/components/projectContainer.jsx#54
```html
  <div>
    <!-- ... -->
    <Link
      onClick={forceShowExperimentList}
      to={`/my-projects/${id}/insights`}
      className="feature"
      id="insights"
    >
    Insights
    </Link>
    <AuthWrapper
      owneronly
      norender
      className="feature"
    >
      <Link
        onClick={forceShowExperimentList}
        to={`/my-projects/${id}/settings`}
        className="feature"
        id="settings"
      >
        Settings
      </Link>
    </AuthWrapper>
  </div>
```

* AuthWrapper with margin helpers, notice that mr-2 and mt-3 appear in Link as well.

web/src/components/repoFeatures.jsx#136
```html
  <AuthWrapper minRole={30} className="mr-2 mt-3">
    <Link
      className="btn btn-dark px-3 mr-2 mt-3"
      to={`/my-projects/${projectId}/pipe-line`}
    >
      Data Pipeline
    </Link>
  </AuthWrapper>
```

* AuthWrapper with an specific resource, this is because is inside a .map list and
needs to check every project. The margin helper m-auto is needed.

web/src/components/projectSet.jsx#164
```html
  <AuthWrapper
    resource={{
      type: 'project',
      id: props.owner,
    }}
    owneronly
    className="m-auto"
  >
    <button
      type="button"
      label="close"
      className="btn btn-danger btn-icon fa fa-times m-auto"
      onClick={
        () => props.handleShowModal(
          props.name,
          props.owner,
        )
      }
    />
  </AuthWrapper>
```
