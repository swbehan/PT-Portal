document.addEventListener('DOMContentLoaded', () => {
  function Appointments() {
    const me = {};

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
          msg: 'Faild to post appointment, please try again later',
          res: req,
        });
        return;
      }
    };

    document.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault();

      const newAppointment = {
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        location: document.getElementById('location').value,
      };

      await me.postAppointment(newAppointment);
    });

    return me;
  }

  Appointments();
});
