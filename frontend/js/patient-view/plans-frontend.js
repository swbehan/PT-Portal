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

    //DEMO STAND IN: This is to represent the auth
    me.loadMyPlans = async () => {
      const allRes = await fetch('/api/workouts');
      if (!allRes.ok) {
        me.showError({
          msg: 'Failed to load plans',
          res: allRes,
          classOfElement: '.my-plans',
        });
        return;
      }
      const all = await allRes.json();
      if (all.workouts.length === 0) {
        renderPlans([], 'Patient');
        return;
      }

      //Pretend sign-in for patient
      const demoPatientId = all.workouts[0].patientId;
      const demoPatientName = all.workouts[0].patientName;

      const myRes = await fetch(`/api/workouts?patientId=${demoPatientId}`);
      if (!myRes.ok) {
        me.showError({
          msg: 'Failed to load your plans',
          res: myRes,
          classOfElement: '.my-plans',
        });
        return;
      }
      const mine = await myRes.json();
      renderPlans(mine.workouts, demoPatientName);
    };

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

  const patientPlans = PatientPlans();
  patientPlans.loadMyPlans();
});
