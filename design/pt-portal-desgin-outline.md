-> Feedback: Great job on your design outline! Its structured well and aligns exactly with your project. No missing elements in the features that I can test on your webpage regarding the features. 
**Project Name:** PT Portal

**Team Members:** Sean Behan, Julian Leonhardt

**Description:** PT Portal is a web-based application that replaces the Google Docs and email workflow used by physical therapy offices. PTs can build and assign workout plans to patients, while patients can book appointments and submit session reviews after each session. A referring doctor can view milestones the PT has logged for their patient. The app supports three roles (PT, Patient, and Doctor) switchable via a role selector in the navbar.

The following features will be available:

- **Create:** PTs can create workout plans with exercises (name, description, video link), post open availability slots, and log patient milestones. Patients can submit session reviews and book open appointment slots.
- **Read:** Patients view their assigned workout plans and upcoming appointments. PTs view submitted patient reviews. Doctors view logged milestones.
- **Update:** PTs can edit existing workout plans and the individual contents of each exercise, including details, video links, and attachments.
- **Delete:** PTs can remove exercises from a plan or delete open appointment slots.

---

**User Personas:**

_Physical Therapist_ Goal: Manage my patients' recovery in one place instead of juggling Google Docs and email. Needs: A way to build and assign workout plans with video guidance, track patient progress through session reviews, and control my appointment availability.

_Patient_ Goal: Stay on top of my recovery program and keep my PT informed on how I'm feeling. Needs: A clear view of my assigned exercises, a simple form to log how each session went, and a way to book my next appointment without emailing back and forth.

_Referring Doctor_ Goal: Stay informed on my patient's PT progress without being involved day-to-day. Needs: A read-only view of milestones the PT has logged for my referred patient.

---

**User Stories:**

_View Assigned Workout_ As a patient, I need to see the exercises my PT has assigned this week, including descriptions and video links, so I know exactly what to do at home between sessions.

_Submit a Session Review_ As a patient, after completing a session I want to submit a short review (rating + notes) so my PT can monitor my progress and adjust my plan if needed.

_Book an Appointment_ As a patient, I want to see my PT's open availability and claim a slot so I don't have to coordinate over email.

_Create a Workout Plan_ As a PT, I want to build a weekly workout plan by adding exercises with descriptions and video links, then assign it to a specific patient.

_View Patient Reviews_ As a PT, I want to read the session reviews my patients submit so I can track their recovery progress and log milestones when they hit a goal.

_View Milestones_ As a referring doctor, I want a simple read-only view of milestones my patient's PT has logged so I can stay informed without being in the weeds.

---

**Work Division:**

Workout Plans (Full Stack) Julian Leonhardt:

- PT: create, edit, and assign workout plans with exercises (name, description, video link)
- Patient: view assigned workout plan and exercises
- Collections: workouts
- Express routes: GET /workouts, POST /workouts, PUT /workouts/:id, DELETE /workouts/:id/exercises/:exerciseId
- Frontend: workout builder UI (PT view) and workout viewer UI (Patient view)

Appointments + Reviews (Full Stack) Sean Behan:

- PT: set open availability slots, view submitted patient reviews, log milestones
- Patient: book an appointment from open slots, submit a session review
- Doctor: read-only milestone view
- Collections: appointments, reviews, milestones
- Express routes: GET/POST /appointments, DELETE /appointments/:id, GET/POST /reviews, GET/POST /milestones
- Frontend: appointment booking UI, review submission form, milestones viewer

**Collections:** users, workouts, appointments, reviews, milestones

---

**Technical Requirements:**

- Node.js will be used as our runtime for our backend
- Express will be the framework stacked on top of Node.js for our backend
- Our frontend interactions will be implemented with Vanilla ES6
- Frontend styling will be controlled with CSS, divided into modules corresponding to HTML files
- Frontend content structure and organization will be maintained with HTML5
- All frontend content will be rendered client-side, no backend rendering
- All ES6 will be structured into modules, defined in the package.json file explicitly and in the HTML
- The backend will use ES Modules throughout, no CommonJS require()
- Any secrets or environment variables will be stored in a .env file and added to .gitignore so no credentials are ever exposed in the repo
- We will use a MIT License
- ESLint config file and Prettier will be used for linting and formatting
- A package.json file will list all dependencies and dev dependencies needed for the project
- MongoDB will be used for data storage
- MongoDB Node.js driver, MongoDB Compass, and MongoDB Atlas will be used for database connection, creation, and control

---

**Post Development:**

- The app will be deployed on Render as a publicly accessible application
- A detailed README will be included covering authors, class link, project objective, screenshot, and instructions to build and run locally
- A short narrated demo video will be recorded walking through the app on both a user and technical level
