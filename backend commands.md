## 1. Health Check
This command checks if the backend server is running.

Purpose: To verify the server is up and responding.

Navigate to c:\users\your-folder\datahub-workspace\backend-api

Command:

PowerShell

curl.exe http://localhost:8080/health
Expected Result: A simple text response: Backend API is up and running!

## 2. User Registration
This command creates a new user account.

Purpose: To register a new user.

Command (PowerShell):

PowerShell

Invoke-WebRequest -Uri http://localhost:8080/api/users/register -Method POST -ContentType "application/json" -Body '{"username": "testuser", "email" : "test@example.com", "password" : "password123"}'
Expected Result: A JSON object of the newly created user with a unique ID.

## 3. User Login & Authentication
This command tests the login functionality by accessing a secure endpoint.

Purpose: To verify user credentials and get back user details.

Command:

PowerShell

curl.exe -u testuser:password123 http://localhost:8080/api/users/me
Expected Result: A JSON object containing the details of the authenticated user. If the password is wrong, it will return a 401 Unauthorized error.

## 4. Create a Data Repository
This command creates a new data repository for the authenticated user.

Purpose: To create a new repository. Requires authentication.

Command (PowerShell):

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Basic " + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("testuser:password123"))
}
$body = @'
{
    "name": "my-first-dataset",
    "description": "A test dataset for cleaning."
}
'@
Invoke-WebRequest -Uri http://localhost:8080/api/repos -Method POST -Headers $headers -Body $body
Expected Result: A 201 Created status and a JSON object of the newly created repository, including its ID and owner details.

## 5. List User's Repositories
This command retrieves all repositories owned by the authenticated user.

Purpose: To get a list of repositories for the logged-in user. Requires authentication.

Command:

PowerShell

curl.exe -u testuser:password123 http://localhost:8080/api/repos
Expected Result: A JSON array containing a list of all repositories owned by testuser.
