document.addEventListener('DOMContentLoaded', () => {
  function Appointments() {
    const me = {};

    // ----------------------------
    // ERROR DISPLAY
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
    me.getUnbookedAppointments = async () => {
      const res = await fetch('/api/appointments-not-booked');
      if (!res.ok) {
        console.error('Failed to fetch listings', res.status, res.statusText);
        me.showError({
          msg: 'Failed to get unbooked appointments, please try again later',
          res: res,
          classOfElement: '.listed-availability',
        });
        return;
      }
      const data = await res.json();
      console.log('Fetched unbooked appointment');

      const appointmentSection = document.querySelector('.listed-availability');
      appointmentSection.innerHTML = '';

      renderAppointments(data.appointmentsUnbooked);
    };

    const renderAppointments = (appointmentsUnbooked) => {
      const appointmentSection = document.querySelector('.listed-availability');
      for (const { date, time, location, _id } of appointmentsUnbooked) {
        const row = document.createElement('div');
        row.className = 'row align-items-center mb-3';

        const appointmentColumn = document.createElement('div');
        appointmentColumn.className = 'col-10 single-unbooked-appointment';
        appointmentColumn.innerHTML = `<div>${formatAppointment(date, time)} -- (${location})</div>`;

        const cancelColumn = document.createElement('div');
        cancelColumn.className = 'col-1';

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

    const formatAppointment = (date, time) => {
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
      return `${formattedDate} at ${formattedTime}`;
    };

    // ----------------------------
    // POST REQUEST
    // ----------------------------
    me.postAppointment = async (appointmentData) => {
      const req = await fetch('/api/add-appointment-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });
      if (!req.ok) {
        console.error('Failed to post appointment', req.status, req.statusText);
        me.showError({
          msg: 'Failed to post appointment, please try again later',
          res: req,
          classOfElement: `.set-availability`,
        });
        return;
      } else {
        console.log('Posted new unbooked listings');
        const toast = new bootstrap.Toast(
          document.getElementById('successToast'),
        );
        toast.show();
        me.getUnbookedAppointments();
      }
    };

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

      await me.postAppointment(newAppointment);
    });

    // ----------------------------
    // DELETE REQUEST
    // ----------------------------

    me.deleteAppointment = async (appointmentId) => {
      const req = await fetch(`/api/delete-appointment/${appointmentId}`, {
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
          classOfElement: `.current-availability-not-booked`,
        });
        return;
      } else {
        console.log('Deleted unbooked appointment');
        me.getUnbookedAppointments();
      }
    };
    // ----------------------------
    // UPDATE REQUEST
    // ----------------------------

    return me;
  }

  const appointmentFrontEnd = Appointments();
  appointmentFrontEnd.getUnbookedAppointments();
});
