document.addEventListener('DOMContentLoaded', () => {
  function DoctorView() {
    const me = {};
    let currentDoctor = null;

    // ----------------------------
    // GET REQUESTS
    // ----------------------------
    me.getPatients = async () => {
      const res = await fetch(
        `/api/appointments?booked=true&referringDoctorId=${currentDoctor._id}&filteredByDate=false`,
      );
      if (!res.ok) {
        console.error('Failed to fetch patients', res.status, res.statusText);
        return;
      }
      const data = await res.json();
      renderPatients(data.appointments);
    };

    me.getMilestonesForPatient = async (patientId, container) => {
      const res = await fetch(`/api/milestones?patientId=${patientId}`);
      if (!res.ok) {
        console.error('Failed to fetch milestones', res.status, res.statusText);
        return;
      }
      const data = await res.json();
      renderMilestones(data.milestones, container);
    };

    // ----------------------------
    // CLIENT SIDE HTML RENDERING
    // ----------------------------
    const renderPatients = (appointments) => {
      const uniquePatients = [
        ...new Map(appointments.map((apt) => [apt.patientName, apt])).values(),
      ];

      const section = document.querySelector('.doctor-patient-listings');
      const row = document.createElement('div');
      row.className = 'row g-4';

      if (appointments.length === 0) {
        section.innerHTML = '<p>No patients to display.</p>';
        return;
      }

      uniquePatients.forEach(({ patientName, patientId }) => {
        const col = document.createElement('div');
        col.className = 'col-6';
        col.innerHTML = `
        <div class="milestone-card">
          <img src="https://static.thenounproject.com/png/881504-200.png" alt="profile image" class="patient-avatar">
          <h4>${patientName}</h4>
          <div class="milestone-display"></div>
        </div>
      `;

        const milestoneContainer = col.querySelector('.milestone-display');
        me.getMilestonesForPatient(patientId, milestoneContainer);

        row.appendChild(col);
      });

      section.appendChild(row);
    };

    const renderMilestones = (milestones, container) => {
      container.innerHTML = '';
      if (milestones.length === 0) {
        container.innerHTML = '<p>No milestones logged yet.</p>';
        return;
      }
      milestones.forEach(({ textMileStone, createdAt }) => {
        const milestone = document.createElement('div');
        milestone.className = 'milestone-entry';
        milestone.innerHTML = `
          <p class="milestone-text">${textMileStone}</p>
          <p class="milestone-date"><strong>${new Date(createdAt).toLocaleDateString()}</strong></p>
        `;
        container.appendChild(milestone);
      });
    };

    // ----------------------------
    // INIT
    // ----------------------------

    me.init = async () => {
      const res = await fetch('/api/current-user?role=doctor');
      const data = await res.json();
      currentDoctor = data.user;
      await me.getPatients();
    };

    return me;
  }

  const doctorView = DoctorView();
  doctorView.init();
});
