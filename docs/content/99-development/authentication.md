# Authentication & User management

Links:
* https://docs.gitlab.com/ce/api/oauth2.html#resource-owner-password-credentials
* https://docs.gitlab.com/ee/api/users.html
* https://gitlab.com/gitlab-org/gitlab/issues/17176

## Strategy: via Backend

* frontend authenticates against backend
* backend creates and manages users
* backend use gitlab rest api as Admin (with secret token)
* backend caches a session
* backend can manage users

### Register

* Backend creates User via Gitlab API and Admin-Token
* Retrieves new User, stores it
* CREATE impersonation Token
* Retrieves and stores it
* Return Token to Frontend

![(auth_flow_backend_register.png](auth-flow-backend-register.png)

### Login

* Backend validates auth data
* if successful, retrieve User object
* test User Token against Gitlab
* if successful, return User Token

![(auth_flow_backend_login.png](auth-flow-backend-login.png)


## Declined Alternative Strategy: via Gitlab

* frontend authenticates against gitlab
    * we don't know how
    * would actually be a man in the middle
* frontend sends token to backend
* backend caches a session
* backend does not need to manage users
* backend cannot manage users

### Register

* Users need to register on Gitlab instance
    * alternative: pass credentials through and write perform man-in-the-middle attack
* Users need to create a PAT token
* Frontend sends PAT to backend
* backend stores PAT, fetches Gitlab user object
* backend stores Gitlab username with Token
