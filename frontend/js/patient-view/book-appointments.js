document.addEventListener('DOMContentLoaded', () => {
  function PatientAppointments() {
    const me = {};

    let cachedAppointments = [];

    // ----------------------------
    // GET REQUEST
    // ----------------------------
    const populatePTDropdown = async () => {
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

    // ----------------------------
    // PUT REQUEST
    // ----------------------------
    const bookAppointment = async (appointmentId) => {
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
      }
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

    me.init = async () => {
      await populatePTDropdown();

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

          await bookAppointment(appointmentId);
          resetForm();
        });
    };

    return me;
  }

  const patientAppointments = PatientAppointments();
  patientAppointments.init();
});
