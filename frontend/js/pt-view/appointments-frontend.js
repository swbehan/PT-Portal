document.addEventListener('DOMContentLoaded', () => {
  function Appointments() {
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
    // GET REQUEST
    // ----------------------------
    me.getAppointments = async (booked) => {
      const res = await fetch(
        `/api/appointments?booked=${booked}&ptId=${currentPT._id}`,
      );
      if (!res.ok) {
        console.error('Failed to fetch listings', res.status, res.statusText);
        me.showError({
          msg: `Failed to get appointments with the filter booked=${booked}, please try again later`,
          res: res,
          classOfElement: '.listed-availability',
        });
        return;
      }
      const data = await res.json();
      console.log(`Fetched appointments with booked=${booked}`);

      if (booked) {
        const appointmentSection = document.querySelector('.booked-schedule');
        appointmentSection.innerHTML = '';
        renderBookedAppointments(data.appointments);
      } else {
        const appointmentSection = document.querySelector(
          '.listed-availability',
        );
        appointmentSection.innerHTML = '';
        renderUnbookedAppointments(data.appointments);
        console.log('unbooked count:', data.appointments.length, data.appointments);
      }
    };

    // ----------------------------
    // POST REQUEST
    // ----------------------------
    me.postAppointment = async (appointmentData) => {
      const req = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...appointmentData }),
      });
      if (!req.ok) {
        console.error('Failed to post appointment', req.status, req.statusText);
        me.showError({
          msg: 'Failed to post appointment, please try again later',
          res: req,
          classOfElement: '.set-availability',
        });
        return;
      } else {
        console.log('Posted new unbooked listings');
        const toast = new bootstrap.Toast(
          document.getElementById('successToast'),
        );
        toast.show();
        me.getAppointments(false);
      }
    };

    // ----------------------------
    // DELETE REQUEST
    // ----------------------------
    me.deleteAppointment = async (appointmentId) => {
      const req = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      });
      if (!req.ok) {
        console.error(
          'Failed to delete unbooked appointment',
          req.status,
          req.statusText,
        );
        me.showError({
          msg: 'Failed to delete appointment, please try again later',
          res: req,
          classOfElement: '.current-availability-not-booked',
        });
        return;
      } else {
        console.log('Deleted unbooked appointment');
        me.getAppointments(false);
      }
    };

    // ----------------------------
    // CLIENT SIDE HTML RENDERING
    // ----------------------------

    const renderUnbookedAppointments = (appointmentsUnbooked) => {
      const appointmentSection = document.querySelector('.listed-availability');
      if (appointmentsUnbooked.length === 0) {
        appointmentSection.innerHTML =
          '<p class="no-upcoming-availability">No upcoming availability listed. Update your availability above.</p>';
        return;
      }
      for (const { date, time, location, _id } of appointmentsUnbooked) {
        const row = document.createElement('div');
        row.className = 'row align-items-center mb-3';

        const appointmentColumn = document.createElement('div');
        appointmentColumn.className = 'col-10 single-unbooked-appointment';
        appointmentColumn.innerHTML = `<div>${formatAppointment(date, time)} -- (${location})</div>`;

        const cancelColumn = document.createElement('div');
        cancelColumn.className = 'col-2';

        const cancelButton = document.createElement('button');
        cancelButton.className = 'cancel-btn';
        cancelButton.innerText = 'Cancel';
        cancelButton.dataset.id = _id;

        cancelColumn.appendChild(cancelButton);
        row.appendChild(appointmentColumn);
        row.appendChild(cancelColumn);
        appointmentSection.appendChild(row);

        cancelButton.addEventListener('click', async () => {
          await me.deleteAppointment(cancelButton.dataset.id);
        });
      }
    };

    const renderBookedAppointments = (appointmentsBooked) => {
      const appointmentSection = document.querySelector('.booked-schedule');
      if (appointmentsBooked.length === 0) {
        appointmentSection.innerHTML =
          '<p class="no-upcoming-availability">No patients have booked with your availability yet</p>';
        return;
      }
      const row = document.createElement('div');
      row.className = 'row g-3';

      for (const { date, time, location, patientName } of appointmentsBooked) {
        const appointmentColumn = document.createElement('div');
        appointmentColumn.className = 'col-4 px-2';
        appointmentColumn.innerHTML = `<div class="single-booked-appointment"><h4 class="booked-title">${patientName}</h4>${formatAppointment(date, time, location)}</div>`;
        row.appendChild(appointmentColumn);
      }

      appointmentSection.appendChild(row);
    };

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

    // ----------------------------
    // INIT
    // ----------------------------
    me.init = async () => {
      const res = await fetch('/api/users?role=pt&name=Dr.+Sarah+Nikki');
      const data = await res.json();
      currentPT = data.users;

      await me.getAppointments(false);
      await me.getAppointments(true);

      document.querySelector('form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const newAppointment = {
          date: document.getElementById('date').value,
          time: document.getElementById('time').value,
          location: document.getElementById('location').value,
        };

        if (
          !newAppointment.date ||
          !newAppointment.time ||
          !newAppointment.location
        ) {
          me.showError({
            msg: 'Please fill out all fields',
            res: { status: 400, statusText: 'Bad Request' },
            classOfElement: '.set-availability',
          });
          return;
        }

        document.getElementById('date').value = '';
        document.getElementById('time').value = '';
        document.getElementById('location').value = '';
        await me.postAppointment(newAppointment);
      });
    };

    return me;
  }

  const appointmentFrontEnd = Appointments();
  appointmentFrontEnd.init();
});
