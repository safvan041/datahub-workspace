
DataHub Workspace 🚀
---------------------------
Welcome to DataHub Workspace! This is a collaborative, version-controlled platform designed to streamline the most time-consuming part of machine learning: data preparation. We apply the principles of open-source software development to datasets, empowering data professionals to build high-quality, transparent, and reproducible assets for training AI models.

## The Problem We Solve
Data scientists often spend up to 80% of their time finding, cleaning, and organizing data. This process is typically manual, lacks versioning, and is difficult to collaborate on. DataHub Workspace aims to fix this by creating a systematic, community-driven workflow for data preparation.

## Tech Stack
Backend: Spring Boot (Java), Go

Data Engine: Python

Frontend: React.js

Database: PostgreSQL

Infrastructure: Docker

## Getting Started
Follow these instructions to get the project set up and running on your local machine for development and testing.

### Prerequisites
Make sure you have the following software installed on your machine:

Git: For version control.

Java (JDK): Version 17 or higher.

PostgreSQL: The database for storing application data.

pgAdmin 4: A GUI tool to manage your PostgreSQL database.

Node.js: Version 18 or higher (for the frontend).

Docker Desktop: (Optional for later use, not required for the current setup).

### Local Setup
Clone the repository:

git clone https://github.com/safvan041/datahub-workspace.git
cd datahub-workspace

Set up the Database:
Make sure your local PostgreSQL server is running.

Open pgAdmin 4.

Create a new user (Login/Group Role) with the following credentials:

Username: datahub

Password: mysecretpassword

Privileges: "Can log in?" -> Yes

Create a new database:

Name: datahub_db

Owner: datahub

Configure the Backend:

The backend is already configured to connect to the local database via the backend-api/src/main/resources/application.yml file. No changes are needed.

Install Frontend Dependencies:

cd frontend
npm install
cd ..

### Running the Application
You will need two separate terminals to run the backend and frontend simultaneously.

Run the Backend API:

# From the project root
cd backend-api
.\mvnw spring-boot:run
The backend will be running on http://localhost:8080.

Run the Frontend:

# From the project root
cd frontend
npm run dev
The frontend will be running on http://localhost:3000.

# If You Want To Run Both Servers At Once Use This From Project Root
(for windows)
    .\start--dev.ps1 

(for linux/macOS)
    chmod +x start-dev.sh
then:
    ./start-dev.sh


## How to Contribute
We follow a feature-branching Git workflow. All contributions should be made via pull requests.

Create a IMP-000X branch from the dh-dev branch.


# Switch to the development branch
git checkout dh-dev

# Pull the latest changes
git pull origin dh-dev

# Create your new feature branch
git checkout -b IMP-000X-short-description
Make your code changes.

Commit your changes with a clear commit message.

Push your feature branch to the remote repository.

git push origin IMP-000X-short-description


