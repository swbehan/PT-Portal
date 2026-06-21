document.addEventListener('DOMContentLoaded', () => {
  function PatientReivew() {
    const me = {};
    let currentPT = null;

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

      const patientsSection = document.querySelector('.patient-listings');
      patientsSection.innerHTML = '';
      renderPatients(data.appointments);
    };

    me.getReviewsFromPatient = async (
      patientId,
      patientName,
      reviewsContainer,
    ) => {
      const res = await fetch(`/api/reviews?patientId=${patientId}`);
      if (!res.ok) {
        console.error('Failed to fetch reviews', res.status, res.statusText);
        return;
      }
      const data = await res.json();
      renderReviews(data.reviews, reviewsContainer);
    };

    // ----------------------------
    // CLIENT SIDE HTML RENDERING
    // ----------------------------
    const renderPatients = (appointments) => {
      const uniquePatients = [
        ...new Map(appointments.map((apt) => [apt.patientName, apt])).values(),
      ];

      const section = document.querySelector('.patient-listings');
      const row = document.createElement('div');
      row.className = 'row g-4';

      if (appointments.length === 0) {
        section.innerHTML =
          '<p class="no-patients-booked">No patients have booked with you. When one does, their reviews will appear here.</p>';
        return;
      }

      uniquePatients.forEach(({ patientName, patientId }) => {
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
                    <form class="mb-2 w-100">
                        <textarea class="form-control mb-2" placeholder="Log a milestone..." rows="5"></textarea>
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
          me.getReviewsFromPatient(patientId, patientName, reviewsContainer);
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
    };

    return me;
  }

  const patientsReviewFrontend = PatientReivew();
  patientsReviewFrontend.init();
});
