<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

# Admin Dashboard App

This is the server-side application for the Admin Dashboard App.

## Table of Contents

- [Admin Dashboard App](#admin-dashboard-app)
  - [Table of Contents](#table-of-contents)
  - [How to Run the App Locally](#how-to-run-the-app-locally)
  - [Production](#production)
  - [API Documentaion](#api-documentaion)

## How to Run the App Locally

1. **Clone the repository**

   ```bash
   git clone https://github.com/Yevgeniy-Dan/nest-admin-dashboard.git
   cd nest-admin-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Set up the Mongo database**
   - Make sure you have Mongo installed and running locally.
4. **Configure environment variables**

   - Create a `.env` file in the project root directory.
   - Set the following environment variables in the `.env` file:

   ```bash

   MONGODB_URI='mongodb+srv://your_username:your_password@cluster0.s9ojk8o.mongodb.net/'
   JWT_ACCESS_KEY=your_generated_access_key
   JWT_REFRESH_KEY=your_generated_refresh_key

   CLIENT_ORIGIN=http://localhost:8000
   AWS_REGION=your_aws_region
   AWS_BUCKET=your_aws_bucket
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key

   MULTER_DEST='./upload'

   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_smtp_user
   SMTP_PASSWORD=your_smtp_password

   API_URL=http://localhost:3000

   PORT=your_app_port

   ```

5. **Start the server**

   ```bash
   npm run start:dev
   ```

   The server will start running on `http://localhost:${your_port}`.

6. **Populate the database with dummy data**

To run the seeder, you would use the following NPM commands in your terminal:

```bash
npm run seed
```

This will execute the seeder and populate the database with initial data.

If you want to refresh the data (clear existing data and seed again), you would run:

```bash
npm run seed:refersh
```

## Production

You can find the deployed version of the application [here](https://nest-admin-dashboard-production.up.railway.app/)

## API Documentaion

API Documentation you can find on https://nest-admin-dashboard-production.up.railway.app/api
