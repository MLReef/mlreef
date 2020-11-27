Authentication & User management
================================
MLReef uses Gitlab as CAS (central authentication service). This means that user accounts are managed in Gitlab.
The management service also has root access to the Gitlab service.

* frontend authenticates against backend
* backend creates and manages users
* backend use gitlab rest api as Admin (with secret token)
* backend caches a session
* backend can manage users

## Register

* Backend creates User via Gitlab API and Admin-Token
* Retrieves new User, stores it
* CREATE impersonation Token
* Retrieves and stores it
* Return Token to Frontend

![auth-flow-backend-register.png](auth-flow-backend-register.png)

## Login

* Backend validates auth data
* if successful, retrieve User object
* test User Token against Gitlab
* if successful, return User Token

![auth_flow_backend_login.png](auth-flow-backend-login.png)


## Additional Information:
* https://docs.gitlab.com/ce/api/oauth2.html#resource-owner-password-credentials
* https://docs.gitlab.com/ee/api/users.html
* https://gitlab.com/gitlab-org/gitlab/issues/17176
