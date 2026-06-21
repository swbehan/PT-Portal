document.addEventListener('DOMContentLoaded', () => {
  function PatientReivew() {
    const me = {};
    let currentPT = null;
    let allPatients = [];

    // ----------------------------
    // ERROR RENDERING
    // ----------------------------
    me.showError = ({ msg, res, classOfElement, type = 'danger' } = {}) => {
      const containerErrorWillAppear = document.querySelector(classOfElement);
      const alert = document.createElement('div');
      alert.className = `alert alert-${type}`;
      alert.role = type;
      alert.innerText = `${msg}: ${res.status} ${res.statusText}`;
      containerErrorWillAppear.prepend(alert);

      setTimeout(() => {
        alert.remove();
      }, 3000);
    };

    // ----------------------------
    // GET REQUESTS
    // ----------------------------
    me.getPatientsFromBookedAppointments = async () => {
      const res = await fetch(
        `/api/appointments?booked=true&ptId=${currentPT._id}&filteredByDate=false`,
      );
      if (!res.ok) {
        console.error(
          'Failed to fetch patients from booked appointments ',
          res.status,
          res.statusText,
        );
        me.showError({
          msg: `Failed to get patients from booked appointments, please try again later`,
          res: res,
          classOfElement: '.patient-listings',
        });
        return;
      }
      const data = await res.json();
      console.log(
        `Fetched all patients that have an appointment booked with ${currentPT.name}`,
      );

      // dedupe to one entry per patient, then cache for client-side search
      allPatients = [
        ...new Map(
          data.appointments.map((apt) => [apt.patientName, apt]),
        ).values(),
      ];
      renderPatients(allPatients);
    };

    me.getReviewsFromPatient = async (patientId, reviewsContainer) => {
      const res = await fetch(`/api/reviews?patientId=${patientId}`);
      if (!res.ok) {
        console.error('Failed to fetch reviews', res.status, res.statusText);
        return;
      }
      const data = await res.json();
      renderReviews(data.reviews, reviewsContainer);
    };

    // ----------------------------
    // POST REQUEST
    // ----------------------------
    me.postMilestone = async (newMilestone) => {
      const req = await fetch('/api/milestones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...newMilestone }),
      });
      if (!req.ok) {
        console.error(
          'Failed to post new milestone',
          req.status,
          req.statusText,
        );
        me.showError({
          msg: 'Failed to post milestone. Please try again later',
          res: req,
          classOfElement: '.patient-listings',
        });
        return;
      } else {
        console.log(`Posted new milestone from ${currentPT.name}`);
        const toast = new bootstrap.Toast(
          document.getElementById('successToast'),
        );
        toast.show();
      }
    };

    // ----------------------------
    // CLIENT SIDE HTML RENDERING
    // ----------------------------
    const renderPatients = (patients) => {
      const section = document.querySelector('.patient-listings');
      section.innerHTML = '';

      if (patients.length === 0) {
        section.innerHTML =
          '<p class="no-patients-booked">No patients found.</p>';
        return;
      }

      const row = document.createElement('div');
      row.className = 'row g-4';

      patients.forEach(({ patientName, patientId }) => {
        const col = document.createElement('div');
        col.className = 'col-6';
        col.innerHTML = `
            <div class="patient-card">
              <h4>${patientName}</h4>
              <img src="https://static.thenounproject.com/png/881504-200.png" alt="blank profile image for ${patientName}" class="patient-avatar">
              <div class="milestone-review"> 
                <button class="btn btn-dark btn-lg w-100" type="button" data-bs-toggle="collapse" data-bs-target="#reviews-${patientId}">
                    View Reviews
                </button>
                <div class="collapse" id="reviews-${patientId}">
                    <div class="patient-reviews">
                        <!-- reviews render here -->
                    </div>
                </div>
                <div class="milestone-form d-flex flex-column align-items-center"> 
                    <h5>Log Patient Milestone</h5>
                    <form class="milestone-log-form mb-2 w-100">
                        <textarea class="form-control mb-2 text-milestone" placeholder="Log a milestone..." rows="5"></textarea>
                        <button type="submit" class="btn submit-btn w-100">Log Milestone</button>
                    </form>
                </div>
            </div>
          `;
        const viewReviewsBtn = col.querySelector(
          'button[data-bs-toggle="collapse"]',
        );
        const reviewsContainer = col.querySelector('.patient-reviews');

        viewReviewsBtn.addEventListener('click', () => {
          me.getReviewsFromPatient(patientId, reviewsContainer);
        });

        // each patient card has its own milestone form, so wire it up here
        const milestoneForm = col.querySelector('.milestone-log-form');
        const milestoneTextarea = col.querySelector('.text-milestone');

        milestoneForm.addEventListener('submit', async (e) => {
          e.preventDefault();

          const newMilestone = {
            textMileStone: milestoneTextarea.value,
            patientId,
            patientName,
            ptName: currentPT.name,
            ptId: currentPT._id,
          };

          if (!newMilestone.textMileStone) {
            me.showError({
              msg: 'Please log a milestone in the textbox below',
              res: { status: 400, statusText: 'Bad Request' },
              classOfElement: '.patient-listings',
            });
            return;
          }

          milestoneTextarea.value = '';
          await me.postMilestone(newMilestone);
        });

        row.appendChild(col);
      });

      section.appendChild(row);
    };

    const renderReviews = (reviews, container) => {
      container.innerHTML = '';
      if (reviews.length === 0) {
        container.innerHTML = '<p>No reviews yet.</p>';
        return;
      }
      reviews.forEach(({ reviewText, rating, createdAt }) => {
        const review = document.createElement('div');
        review.className = 'review-item';
        review.innerHTML = `
        <div class="review-entry">
            <div class="review-header">
                <span class="review-rating">${rating}/10</span>
                <small class="review-date">${new Date(createdAt).toLocaleDateString()}</small>
            </div>
            <p class="review-text">${reviewText}</p>
        </div>
        `;
        container.appendChild(review);
      });
    };

    // ----------------------------
    // INIT
    // ----------------------------
    me.init = async () => {
      const res = await fetch('/api/current-user?role=pt');
      const data = await res.json();
      currentPT = data.user;

      await me.getPatientsFromBookedAppointments();

      const searchBar = document.querySelector('#search-input');

      searchBar.addEventListener('input', (event) => {
        const query = event.target.value.toLowerCase().trim();
        const filtered = allPatients.filter((patient) =>
          patient.patientName.toLowerCase().includes(query),
        );
        renderPatients(filtered);
      });
    };

    return me;
  }

  const patientsReviewFrontend = PatientReivew();
  patientsReviewFrontend.init();
});
