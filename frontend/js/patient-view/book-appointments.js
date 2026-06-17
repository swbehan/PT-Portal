document.addEventListener('DOMContentLoaded', () => {
  function PatientAppointments() {
    const me = {};
    let currentPatient = null;

    let cachedAppointments = [];

    // ----------------------------
    // GET REQUEST
    // ----------------------------

    me.getAppointments = async () => {
      const res = await fetch(
        `/api/appointments?booked=true&patientId=${currentPatient._id}`,
      );
      if (!res.ok) {
        console.error(
          `Failed to fetch appointments booked by ${currentPatient.name}`,
          res.status,
          res.statusText,
        );
        return;
      }
      const data = await res.json();
      console.log(`Fetched appointments booked by the user`);

      const appointmentSection = document.querySelector('.booked-schedule');
      appointmentSection.innerHTML = '';
      renderBookedAppointments(data.appointments);
    };

    me.populatePTDropdown = async () => {
      const res = await fetch('/api/users?role=pt');
      const data = await res.json();

      const ptSelect = document.getElementById('pt-select');
      data.users.forEach(({ name, _id }) => {
        const option = document.createElement('option');
        option.value = _id;
        option.innerText = name;
        ptSelect.appendChild(option);
      });
    };

    // ----------------------------
    // PUT REQUEST
    // ----------------------------
    me.bookAppointment = async (appointmentId) => {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        console.error('Failed to book appointment', res.status, res.statusText);
        return;
      } else {
        const toast = new bootstrap.Toast(
          document.getElementById('successToast'),
        );
        toast.show();
        const data = await res.json();
        console.log(data.message);
        me.getAppointments();
      }
    };

    // ----------------------------
    // CLIENT SIDE HTML RENDERING
    // ----------------------------

    const formatAppointment = (date, time, location = '') => {
      const dateObj = new Date(`${date}T${time}`);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      const formattedTime = dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      if (location === '') {
        return `${formattedDate} at ${formattedTime}`;
      } else {
        return `<div>Date:<ul><li>${formattedDate}</li></ul>  Time:<ul><li>${formattedTime}</li></ul>  Location:<ul><li>${location}</li></ul><span>Appointment length is 45 minutes</span></div>`;
      }
    };

    const populateDateDropdown = async (ptId) => {
      const res = await fetch(`/api/appointments?booked=false&ptId=${ptId}`);
      const data = await res.json();
      cachedAppointments = data.appointments;

      const dateSelect = document.getElementById('date-select');
      dateSelect.disabled = false;
      dateSelect.innerHTML = '<option value="">Select</option>';

      data.appointments.forEach((apt) => {
        const option = document.createElement('option');
        option.value = apt._id;
        option.innerText = formatAppointment(apt.date, apt.time);
        dateSelect.appendChild(option);
      });
    };

    const updateLocation = (appointmentId) => {
      const selectedAppointment = cachedAppointments.find(
        (apt) => apt._id === appointmentId,
      );
      const locationInput = document.getElementById('location-select');
      if (selectedAppointment) {
        locationInput.disabled = false;
        locationInput.value = selectedAppointment.location;
      }
    };

    const renderBookedAppointments = (appointmentsBooked) => {
      const appointmentSection = document.querySelector('.booked-schedule');
      if (appointmentsBooked.length === 0) {
        appointmentSection.innerHTML =
          '<p class="no-upcoming-availability">You have not booked any appointments yet</p>';
        return;
      }
      const row = document.createElement('div');
      row.className = 'row g-3';

      for (const {
        date,
        time,
        location,
        ptOfAppointment,
      } of appointmentsBooked) {
        const appointmentColumn = document.createElement('div');
        appointmentColumn.className = 'col-4 px-2';
        appointmentColumn.innerHTML = `<div class="single-booked-appointment"><h4 class="booked-title">${ptOfAppointment}</h4>${formatAppointment(date, time, location)}</div>`;
        row.appendChild(appointmentColumn);
      }

      appointmentSection.appendChild(row);
    };

    const resetForm = () => {
      document.getElementById('pt-select').value = '';
      const dateSelect = document.getElementById('date-select');
      dateSelect.innerHTML = '<option value="">Select a PT first</option>';
      dateSelect.disabled = true;
      const locationInput = document.getElementById('location-select');
      locationInput.value = '';
      locationInput.disabled = true;
      cachedAppointments = [];
    };

    // ----------------------------
    // INIT
    // ----------------------------
    me.init = async () => {
      const res = await fetch('/api/users?role=patient&name=Sofia+Terry');
      const data = await res.json();
      currentPatient = data.users;
      await me.getAppointments();
      await me.populatePTDropdown();

      document
        .getElementById('pt-select')
        .addEventListener('change', async (e) => {
          const ptId = e.target.value;
          if (ptId) {
            await populateDateDropdown(ptId);
          } else {
            document.getElementById('date-select').disabled = true;
            document.getElementById('location-select').disabled = true;
            document.getElementById('location-select').value = '';
          }
        });

      document.getElementById('date-select').addEventListener('change', (e) => {
        const appointmentId = e.target.value;
        if (appointmentId) {
          updateLocation(appointmentId);
        } else {
          document.getElementById('location-select').disabled = true;
          document.getElementById('location-select').value = '';
        }
      });

      document
        .getElementById('book-appointment-form')
        .addEventListener('submit', async (e) => {
          e.preventDefault();
          const appointmentId = document.getElementById('date-select').value;
          if (!appointmentId) return;

          await me.bookAppointment(appointmentId);
          resetForm();
        });
    };

    return me;
  }

  const patientAppointments = PatientAppointments();
  patientAppointments.init();
});
