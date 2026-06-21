document.addEventListener('DOMContentLoaded', () => {
  function PatientReviews() {
    const me = {};
    let currentPatient = null;

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
    // POST REQUEST
    // ----------------------------
    me.postReview = async (newReview) => {
      const req = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...newReview }),
      });
      if (!req.ok) {
        console.error('Failed to post review', req.status, req.statusText);
        me.showError({
          msg: 'Failed to post review. Please try again later',
          res: req,
          classOfElement: '.review-card',
        });
        return;
      } else {
        console.log(`Posted new review from ${currentPatient.name}`);
        const toast = new bootstrap.Toast(
          document.getElementById('successToast'),
        );
        toast.show();
      }
    };

    // ----------------------------
    // INIT
    // ----------------------------
    me.init = async () => {
      const res = await fetch('/api/current-user?role=patient');
      const data = await res.json();
      currentPatient = data.user;

      document.querySelector('form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const newReview = {
          reviewText: document.getElementById('review-text').value,
          rating: document.getElementById('rating').value,
          patientName: currentPatient.name,
          patientId: currentPatient._id,
        };

        if (!newReview.reviewText || !newReview.rating) {
          me.showError({
            msg: 'Please fill out all fields',
            res: { status: 400, statusText: 'Bad Request' },
            classOfElement: '.review-card',
          });
          return;
        }

        document.getElementById('review-text').value = '';
        document.getElementById('rating').value = '';
        me.postReview(newReview);
      });
    };

    return me;
  }

  const patientReviewFrontend = PatientReviews();
  patientReviewFrontend.init();
});
