document.addEventListener('DOMContentLoaded', () => {
  function Plans() {
    const me = {};
    let editingId = null; // null = create mode; a workout _id = edit mode

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
      alert.scrollIntoView({ behavior: 'smooth', block: 'center' });

      setTimeout(() => {
        alert.remove();
      }, 3000);
    };

    // ----------------------------
    // LOAD PATIENTS INTO THE DROPDOWN
    // ----------------------------
    me.loadPatients = async () => {
      const res = await fetch('/api/users?role=patient');
      if (!res.ok) {
        me.showError({
          msg: 'Failed to load patients',
          res,
          classOfElement: '.build-plan',
        });
        return;
      }
      const data = await res.json();
      const select = document.getElementById('patient');
      select.innerHTML = '<option value="">Select a patient...</option>';
      for (const patient of data.users) {
        const option = document.createElement('option');
        option.value = patient._id;
        option.textContent = patient.name;
        select.appendChild(option);
      }
    };

    // ----------------------------
    // GET AND RENDER EXISTING PLANS
    // ----------------------------
    me.getPlans = async () => {
      const res = await fetch('/api/workouts');
      if (!res.ok) {
        me.showError({
          msg: 'Failed to load plans',
          res,
          classOfElement: '.existing-plans',
        });
        return;
      }
      const data = await res.json();
      renderPlans(data.workouts);
    };

    const renderPlans = (plans) => {
      const list = document.querySelector('.plans-list');
      list.innerHTML = '';
      if (plans.length === 0) {
        list.innerHTML =
          '<p class="no-plans">No plans yet. Build one above.</p>';
        return;
      }
      for (const plan of plans) {
        const card = document.createElement('div');
        card.className = 'plan-card';

        const heading = document.createElement('h4');
        heading.textContent = `${plan.title} - ${plan.patientName}`;
        card.appendChild(heading);

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'edit-plan-btn';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => loadPlanIntoForm(plan));
        card.appendChild(editBtn);

        for (const ex of plan.exercises) {
          const item = document.createElement('div');
          item.className = 'exercise-item';

          const info = document.createElement('div');
          info.innerHTML = `<strong>${ex.name}</strong> - ${ex.description} (<a href="${ex.videoLink}" target="_blank">video</a>)`;

          const removeBtn = document.createElement('button');
          removeBtn.className = 'remove-exercise-btn';
          removeBtn.textContent = 'x';
          removeBtn.addEventListener('click', () =>
            me.deleteExercise(plan._id, ex._id),
          );

          item.appendChild(info);
          item.appendChild(removeBtn);
          card.appendChild(item);
        }
        list.appendChild(card);
      }
    };

    // ----------------------------
    // DYNAMIC EXERCISE ROWS
    // ----------------------------
    const addExerciseRow = (ex = {}) => {
      const container = document.getElementById('exercises-container');
      const row = document.createElement('div');
      row.className = 'exercise-row row gy-2';
      // stash the existing exercise's _id so PUT can preserve its identity
      if (ex._id) row.dataset.exerciseId = ex._id;
      row.innerHTML = `
        <div class="col-12"><input type="text" class="form-control ex-name" placeholder="Exercise name" value="${ex.name || ''}" /></div>
        <div class="col-12"><input type="text" class="form-control ex-description" placeholder="Description (sets/reps)" value="${ex.description || ''}" /></div>
        <div class="col-12"><input type="url" class="form-control ex-video" placeholder="Video link" value="${ex.videoLink || ''}" /></div>
      `;
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'remove-exercise-btn';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', () => row.remove());

      row.appendChild(removeBtn);
      container.appendChild(row);
    };

    document
      .getElementById('add-exercise')
      .addEventListener('click', () => addExerciseRow());

    // Read every row currently in the DOM into a plain array
    const gatherExercises = () => {
      const rows = document.querySelectorAll('.exercise-row');
      const exercises = [];
      for (const row of rows) {
        const ex = {
          name: row.querySelector('.ex-name').value,
          description: row.querySelector('.ex-description').value,
          videoLink: row.querySelector('.ex-video').value,
        };
        // carry the _id back for existing exercises so PUT keeps them;
        // new rows have no _id, so the backend mints one
        if (row.dataset.exerciseId) ex._id = row.dataset.exerciseId;
        exercises.push(ex);
      }
      return exercises;
    };

    // ----------------------------
    // EDIT MODE HELPERS
    // ----------------------------
    const loadPlanIntoForm = (plan) => {
      editingId = plan._id;
      document.getElementById('title').value = plan.title;
      const select = document.getElementById('patient');
      select.value = plan.patientId;
      select.disabled = true; // patient can't be reassigned while editing
      document.getElementById('exercises-container').innerHTML = '';
      for (const ex of plan.exercises) addExerciseRow(ex);
      document.querySelector('.submit-btn').textContent = 'Update Plan';
      document
        .querySelector('.build-plan')
        .scrollIntoView({ behavior: 'smooth' });
    };

    const resetForm = () => {
      editingId = null;
      document.getElementById('plan-form').reset();
      document.getElementById('exercises-container').innerHTML = '';
      document.getElementById('patient').disabled = false;
      document.querySelector('.submit-btn').textContent = 'Create Plan';
    };

    // ----------------------------
    // SUBMIT THE FORM (POST)
    // ----------------------------
    me.postPlan = async (planData) => {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData),
      });
      if (!res.ok) {
        me.showError({
          msg: 'Failed to create plan',
          res,
          classOfElement: '.build-plan',
        });
        return;
      }
      const toast = new bootstrap.Toast(
        document.getElementById('successToast'),
      );
      toast.show();
      resetForm();
      me.getPlans();
    };

    // ----------------------------
    // UPDATE A PLAN (PUT)
    // ----------------------------
    me.updatePlan = async (id, planData) => {
      const res = await fetch(`/api/workouts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData),
      });
      if (!res.ok) {
        me.showError({
          msg: 'Failed to update plan',
          res,
          classOfElement: '.build-plan',
        });
        return;
      }
      const toast = new bootstrap.Toast(
        document.getElementById('successToast'),
      );
      toast.show();
      resetForm();
      me.getPlans();
    };

    document
      .getElementById('plan-form')
      .addEventListener('submit', async (e) => {
        e.preventDefault();
        const select = document.getElementById('patient');
        const planData = {
          title: document.getElementById('title').value,
          patientId: select.value,
          patientName: select.options[select.selectedIndex].text,
          exercises: gatherExercises(),
        };
        const hasBlankExercise = planData.exercises.some(
          (ex) => !ex.name || !ex.description || !ex.videoLink,
        );
        if (
          !planData.title ||
          !planData.patientId ||
          planData.exercises.length === 0 ||
          hasBlankExercise
        ) {
          me.showError({
            msg: 'Please add a title, pick a patient, and fill out every field for each exercise',
            res: { status: 400, statusText: 'Bad Request' },
            classOfElement: '.build-plan',
          });
          return;
        }
        if (editingId) {
          await me.updatePlan(editingId, planData);
        } else {
          await me.postPlan(planData);
        }
      });

    // ----------------------------
    // DELETE ONE EXERCISE
    // ----------------------------
    me.deleteExercise = async (workoutId, exerciseId) => {
      const res = await fetch(
        `/api/workouts/${workoutId}/exercises/${exerciseId}`,
        {
          method: 'DELETE',
        },
      );
      if (!res.ok) {
        me.showError({
          msg: 'Failed to delete exercise',
          res,
          classOfElement: '.existing-plans',
        });
        return;
      }
      me.getPlans();
    };

    return me;
  }

  const plansFrontEnd = Plans();
  plansFrontEnd.loadPatients();
  plansFrontEnd.getPlans();
});
