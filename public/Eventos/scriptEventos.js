const API_URL = '/api/eventos';


const list = document.getElementById('eventList');
const form = document.getElementById('eventForm');
const fechaInput = document.getElementById('fecha');
const editFechaInput = document.getElementById('editFecha');
const modoOscuroBtn = document.getElementById('modoOscuroBtn');



document.addEventListener('DOMContentLoaded', () => {
  cargarEventos();
  ajustarFechaMinima();
  aplicarModoOscuroGuardado();
});


function cargarEventos() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      list.innerHTML = '';

      
      document.getElementById('eventCount').textContent = `Total de eventos: ${data.length}`;

      data.forEach(evento => {
        const li = document.createElement('li');
        li.innerHTML = `
          ${evento.nombre} - ${evento.fecha} - ${evento.descripcion || ''}
          <button onclick="eliminarEvento(${evento.id})">Eliminar</button>
          <button onclick="mostrarFormularioEdicion(${evento.id}, '${evento.nombre}', '${evento.fecha}', \`${evento.descripcion || ''}\`)">Editar</button>
        `;
        list.appendChild(li);
      });
    });
}

function validarFecha(fecha) {
  const fechaIngresada = new Date(fecha);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return fechaIngresada > hoy;
}

function ajustarFechaMinima() {
  const hoy = new Date();
  hoy.setDate(hoy.getDate() + 1);
  const minFecha = hoy.toISOString().split('T')[0];
  fechaInput.min = minFecha;
  editFechaInput.min = minFecha;
}



form.addEventListener('submit', e => {
  e.preventDefault();
  const datos = Object.fromEntries(new FormData(form));

  if (!validarFecha(datos.fecha)) {
    alert('La fecha debe ser posterior al día actual.');
    return;
  }

  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  })
    .then(res => res.json())
    .then(() => {
      form.reset();
      cargarEventos();
    })
    .catch(err => console.error('Error al enviar los datos:', err));
});


function mostrarFormularioEdicion(id, nombre, fecha, descripcion) {
  document.getElementById('editId').value = id;
  document.getElementById('editNombre').value = nombre;
  document.getElementById('editFecha').value = fecha;
  document.getElementById('editDescripcion').value = descripcion;

  document.getElementById('editModal').classList.add('visible');
  document.getElementById('overlay').classList.add('visible');
}

function cerrarModal() {
  document.getElementById('editModal').classList.remove('visible');
  document.getElementById('overlay').classList.remove('visible');
  document.getElementById('editForm').reset();

  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
}

document.getElementById('editForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const id = document.getElementById('editId').value;
  const datosActualizados = {
    nombre: document.getElementById('editNombre').value,
    fecha: document.getElementById('editFecha').value,
    descripcion: document.getElementById('editDescripcion').value
  };

  if (!validarFecha(datosActualizados.fecha)) {
    alert('La fecha debe ser posterior al día actual.');
    return;
  }

  actualizarEvento(id, datosActualizados);
  cerrarModal();
});

function actualizarEvento(id, datos) {
  fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  })
    .then(res => res.json())
    .then(() => cargarEventos());
}



function eliminarEvento(id) {
  const confirmacion = window.confirm('¿Estás seguro de que quieres eliminar este evento?');
  if (!confirmacion) return;

  const li = [...list.children].find(li =>
    li.innerHTML.includes(`eliminarEvento(${id})`)
  );

  if (li) {
    li.classList.add('fade-out');

    setTimeout(() => {
      fetch(`${API_URL}/${id}`, { method: 'DELETE' })
        .then(() => cargarEventos());
    }, 300);
  }
}


function buscarEventos() {
  const query = document.getElementById('searchQuery').value.toLowerCase();

  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      list.innerHTML = '';
      const filtrados = data.filter(evento =>
        evento.nombre.toLowerCase().includes(query) || evento.fecha.includes(query)
      );

      filtrados.forEach(evento => {
        const li = document.createElement('li');
        li.innerHTML = `
          ${evento.nombre} - ${evento.fecha} - ${evento.descripcion || ''}
          <button onclick="eliminarEvento(${evento.id})">Eliminar</button>
          <button onclick="mostrarFormularioEdicion(${evento.id}, '${evento.nombre}', '${evento.fecha}', \`${evento.descripcion || ''}\`)">Editar</button>
        `;
        list.appendChild(li);
      });
    });
}


modoOscuroBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');

  const esOscuro = document.body.classList.contains('dark-mode');
  modoOscuroBtn.textContent = esOscuro ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
  localStorage.setItem('modoOscuro', esOscuro);
});

function aplicarModoOscuroGuardado() {
  if (localStorage.getItem('modoOscuro') === 'true') {
    document.body.classList.add('dark-mode');
    modoOscuroBtn.textContent = '☀️ Modo Claro';
  }
}



document.getElementById('overlay').addEventListener('click', cerrarModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    cerrarModal();
  }
});
