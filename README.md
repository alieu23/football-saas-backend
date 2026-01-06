## Football Management - Backend API Documentation

### SaaS backend for managing multiple football clubs.

#### Overview
This backend powers Football Manager, providing APIs for authentication, user management, and core business operations.
It follows **REST** principles, uses **JWT authentication**, and supports role-based access control.

#### Tech Stack
- Runtime: Node.js
- Framework: Express.js
- Database: PostgreSQL
- ORM/ODM: Sequelize
- Auth: JWT
- Request Logging: Morgan
- Validation: Zod
- Security: Helmet
- Containerization: Docker

#### Architecture
**Client (Web / Mobile)** --> **API Gateway / Express Server** --> **Services** --> **Database**

##### Design principles:
- Separation of concerns

- Stateless APIs

- Scalable multi-tenant ready

### Project Structure
Src
-   controllers
-   models
-   services
-   routes
-   middlewares
-   validators
-   utils
-   app.ts
-   server.ts

### Environment Variable
**Required Environment Variables**
-   PORT=5000
-   DATABASE_URL=postgres://user:password@localhost:5432/db_name
-   JWT_SECRET=your_secret_key
-   JWT_EXPIRES_IN=1h

### Running The Project
-   #### Install dependencies
    npm install

-   #### Run DB migrations
    npx sequelize-cli db:migrate

-   #### Run DB migrations
    npm run dev
    API will be available at:
    http://localhost:4000

### Authentication & Authorization
-   Authentication via **JWT Bearer Tokens**
-   Token must be included in request headers:
        Authorization: Bearer <token>

### Roles & Permissions
-   **SUPER_ADMIN** --> System Owner
-   **CLUB_ADMIN** --> Club Admin
-   **CLUB_MANAGER** --> Club Manager

### API Conventions
-   RESTful endpoints
-   JSON request/response format
-   Plural resource naming
-   Standard HTTP status codes

| Status Code | Meaning                                                  |
| ----------- | -------------------------------------------------------- |
| 200         | OK – Request succeeded                                   |
| 201         | Created – Resource created successfully                  |
| 204         | No Content – Request succeeded with no response body     |
| 400         | Bad Request – Invalid or malformed request               |
| 401         | Unauthorized – Authentication required or failed         |
| 403         | Forbidden – You do not have permission                   |
| 404         | Not Found – Resource not found                           |
| 409         | Conflict – Resource already exists                       |
| 422         | Unprocessable Entity – Validation error                  |
| 500         | Internal Server Error – Server failed to process request |
| 502         | Bad Gateway – Invalid response from upstream server      |
| 503         | Service Unavailable – Server temporarily unavailable     |

### API Endpoints
#### Creat User / Register
**POST** /auth/register
-   {
    "name": "Spurs FA Admin",
    "email": "admin@pursfa.com",
    "password": "password123"

    }
Response
-   {"id":2,"name":"Spurs FA Admin","email":"admin@pursfa.com","role":"STAFF","clubId":null}

#### Login
**POST** /auth/login
-   {
    "email": "admin@pursfa.com",
    "password": "password123"
    }
Response
-   {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImNsdWJJZCI6MSwicm9sZSI6IkNMVUJfQURNSU4iLCJpYXQiOjE3NjY5NDI3MTEsImV4cCI6MTc2NzU0NzUxMX0.6Il_oipBBKLYfWzXJtQrEUjCj3Bq_37cPG7vyLB7zPc",
    "user": {
        "id": 2,
        "name": "Spurs FA Admin",
        "email": "admin@pursfa.com",
        "role": "CLUB_ADMIN",
        "clubId": 1
    }
}







  

    