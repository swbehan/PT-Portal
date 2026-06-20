# PT Portal

PT Portal is a web application that replaces the Google Docs and email workflow used by physical therapy offices. Physical therapists build and assign workout plans, patients book appointments and submit session reviews, and referring doctors get a read-only view of patient milestones. The app supports three roles — **PT**, **Patient**, and **Doctor** — selectable from the sign-in page.

## Authors

- **Sean Behan**
- **Julian Leonhardt**

## Class

CS5610 Web Development — Northeastern University.

https://johnguerra.co/classes/webDevelopment_online_summer_2026/

## Project Objective

Physical therapy offices often manage patient care through scattered Google Docs and email chains. PT Portal brings it all into one place: therapists can create and assign workout plans with video guidance, patients can stay on top of their recovery and book their own appointments, and referring doctors can monitor progress without being involved day to day.

## Features

**Physical Therapist**

- Build workout plans with exercises (name, description, video link) and assign them to a patient
- Edit existing plans and remove individual exercises
- Set open appointment availability and view booked sessions
- Read patient session reviews and log recovery milestones

**Patient**

- View their assigned workout plan with exercise details and video links
- Book an appointment from the PT's open availability
- Submit session reviews after each visit

**Doctor**

- Read-only view of milestones the PT has logged for their referred patient

## Tech Stack

- **Runtime / Server:** Node.js + Express (ES modules)
- **Database:** MongoDB (native MongoDB Node.js driver — no Mongoose)
- **Frontend:** Vanilla ES6, client-side rendering only (no server-side rendering, no template engines)
- **Styling:** CSS organized into per-page modules + Bootstrap 5.3
- **Tooling:** ESLint + Prettier

## Screenshots

### Home & Sign In

![Home page](./screenshots/PT-HOMEPAGE.png)
![Home page continued](./screenshots/PT-HOMEPAGE2.png)
![Sign in as a role](./screenshots/PT-HOMEPAGE-SIGNIN.png)

### Physical Therapist — Workout Plan Builder

![Building a workout plan](./screenshots/PT-BUILDWORKOUT.png)
![Workout plan with exercises](./screenshots/PT-BUILDWORK2.png)

### Physical Therapist — Availability & Schedule

![Setting availability](./screenshots/PT-AVAILABILITY.png)
![Setting availability countinued](./screenshots/PT-AVAILABILITY2.png)
![Booked schedule](./screenshots/PT-SCHEDULE.png)

### Patient

![Assigned workout plan](./screenshots/PT-PATIENT-PLAN.png)
![Booking an appointment](./screenshots/PT-PATIENT-BOOK.png)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- A MongoDB database — a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works well

### 1. Clone and install

```bash
git clone https://github.com/swbehan/PT-Portal.git
cd PT-Portal
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root (it is gitignored — never commit it):

```
MONGO_URI=your-mongodb-connection-string
PORT=3000
```

See `.env.example` for the required keys.

### 3. (Optional) Seed sample data

Populate the `workouts` collection with sample plans linked to real patients:

```bash
npm run seed
```

### 4. Run the app

```bash
npm run dev     # development (auto-restart on changes via nodemon)
# or
npm start       # production
```

Then open **http://localhost:3000** in your browser.

## Deployment

<!-- TODO: add the public deployment URL once the app is hosted -->

_Deployment URL: TBD_

## Project Structure

```
db/        MongoDB connection + per-collection data modules
routes/    Express routers (appointments, workouts, users)
frontend/  Client-side pages, JS, and CSS modules
scripts/   One-off utilities (e.g. database seeding)
screenshots/ Screenshots of the application to supply the readme
server.js  Express app entry point
```

## AI Usage


Julian: 

I used an AI coding assistant (Claude Code) during development, primarily as a guided tutor and code reviewer rather than to generate the project wholesale. Specifically, it was used to:

- Explain concepts and recommend approaches before I wrote code
- Review my code and help diagnose bugs (syntax errors, data-model mismatches, fetch issues)
- Generate some boilerplate and repetitive scaffolding, which I then reviewed and adapted
- Help write the database seed script and this README

All code was reviewed and understood by me, and the architectural decisions were all mine.

## License

This project is licensed under the [MIT License](./LICENSE).
