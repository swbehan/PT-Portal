document.addEventListener('DOMContentLoaded', () => {
  function PatientPlans() {
    const me = {};

    me.showError = ({ msg, res, classOfElement, type = 'danger' } = {}) => {
      const container = document.querySelector(classOfElement);
      const alert = document.createElement('div');
      alert.className = `alert alert-${type}`;
      alert.role = type;
      alert.innerText = `${msg}: ${res.status} ${res.statusText}`;
      container.prepend(alert);
      setTimeout(() => alert.remove(), 3000);
    };

    // ----------------------------
    // GET REQUEST
    // ----------------------------

    // Mocked auth: resolve the signed-in patient persona, then load only their plans.
    me.loadMyPlans = async () => {
      const userRes = await fetch('/api/current-user?role=patient');
      if (!userRes.ok) {
        me.showError({
          msg: 'Failed to load your profile',
          res: userRes,
          classOfElement: '.my-plans',
        });
        return;
      }
      const { user } = await userRes.json();

      const myRes = await fetch(`/api/workouts?patientId=${user._id}`);
      if (!myRes.ok) {
        me.showError({
          msg: 'Failed to load your plans',
          res: myRes,
          classOfElement: '.my-plans',
        });
        return;
      }
      const mine = await myRes.json();
      renderPlans(mine.workouts, user.name);
    };

    // ----------------------------
    // CLIENT SIDE HTML RENDERING
    // ----------------------------

    const renderPlans = (plans, patientName) => {
      document.querySelector('.welcome-heading').textContent =
        `Welcome back, ${patientName}`;
      const section = document.querySelector('.assigned-plans');
      section.innerHTML = '';
      if (plans.length === 0) {
        section.innerHTML =
          '<p class="no-plans"> No plans assigned yet. Check back in a little bit</p>';
        return;
      }
      for (const plan of plans) {
        const card = document.createElement('div');
        card.className = 'plan-card';

        const heading = document.createElement('h3');
        heading.textContent = plan.title;
        card.appendChild(heading);

        for (const ex of plan.exercises) {
          const item = document.createElement('div');
          item.className = 'exercise-item';
          item.innerHTML = `<strong>${ex.name}</strong> — ${ex.description} · <a href="${ex.videoLink}" target="_blank">Watch video</a>`;
          card.appendChild(item);
        }
        section.appendChild(card);
      }
    };

    return me;
  }

  // ----------------------------
  // INIT
  // ----------------------------
  const patientPlans = PatientPlans();
  patientPlans.loadMyPlans();
});
