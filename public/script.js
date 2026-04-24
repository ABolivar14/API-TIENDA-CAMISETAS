const API_URL = '/api/usuarios';
const list = document.querySelector('.user-list'); // CAMBIO: ahora usa la clase correcta
const form = document.getElementById('userForm');
const toggleBtn = document.getElementById('toggleTheme');

// === INICIALIZAR MODO OSCURO DESDE LOCALSTORAGE ===
if (localStorage.getItem('tema') === 'oscuro') {
  document.body.classList.add('dark');
  toggleBtn.textContent = '☀️ Tema Claro';
} else {
  toggleBtn.textContent = '🌙 Tema Oscuro';
}

// === TOGGLE DE MODO OSCURO ===
toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const esOscuro = document.body.classList.contains('dark');
  toggleBtn.textContent = esOscuro ? '☀️ Tema Claro' : '🌙 Tema Oscuro';
  localStorage.setItem('tema', esOscuro ? 'oscuro' : 'claro');
});

function cargarUsuarios() {
  document.getElementById('loader').style.display = 'block';

  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      console.log(data);
      list.innerHTML = '';
      data.forEach(user => {
        const li = document.createElement('li');
        li.innerHTML = `
          ${user.nombre} - ${user.email} - ${user.estado} - $${user.saldo}
          <button onclick="eliminarUsuario(${user.id})">Eliminar</button>
          <button onclick="mostrarFormularioEdicion(${user.id}, '${user.nombre}', '${user.email}', '${user.estado}', ${user.saldo})">Editar</button>
        `;

        li.classList.add('nuevo-usuario');
        setTimeout(() => li.classList.remove('nuevo-usuario'), 1500);

        list.appendChild(li);
      });

      document.getElementById('loader').style.display = 'none';
      document.getElementById('contadorUsuarios').textContent = `Usuarios cargados: ${data.length}`;
    });
}



form.addEventListener('submit', e => {
  e.preventDefault();
  const datos = Object.fromEntries(new FormData(form));

  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  })
  .then(res => res.json())
  .then(() => {
    form.reset();
    cargarUsuarios();
  })
  .catch(err => {
    console.error('Error al enviar los datos:', err);
  });
});

function mostrarFormularioEdicion(id, nombre, email, estado, saldo) {
  document.getElementById('editId').value = id;
  document.getElementById('editNombre').value = nombre;
  document.getElementById('editEmail').value = email;
  document.getElementById('editEstado').value = estado;
  document.getElementById('editSaldo').value = saldo;

  document.getElementById('editModal').classList.add('visible');
  document.getElementById('modalOverlay').classList.add('visible');
}

function cerrarModal() {
  document.getElementById('editModal').classList.remove('visible');
  document.getElementById('modalOverlay').classList.remove('visible');
}


document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') cerrarModal();
});

window.addEventListener('click', (e) => {
  const modal = document.getElementById('editModal');
  if (e.target === modal) cerrarModal();
});

document.getElementById('editForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const id = document.getElementById('editId').value;
  const datosActualizados = {
    nombre: document.getElementById('editNombre').value,
    email: document.getElementById('editEmail').value,
    estado: document.getElementById('editEstado').value,
    saldo: parseFloat(document.getElementById('editSaldo').value)
  };

  actualizarUsuario(id, datosActualizados);
  cerrarModal();
});

function actualizarUsuario(id, datosActualizados) {
  fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosActualizados)
  })
  .then(res => res.json())
  .then(() => cargarUsuarios());
}

function eliminarUsuario(id) {
  if (confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
    fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      .then(() => cargarUsuarios());
  }
}


document.getElementById('buscador').addEventListener('input', function () {
  const filtro = this.value.toLowerCase();
  const items = list.getElementsByTagName('li');
  Array.from(items).forEach(li => {
    const texto = li.textContent.toLowerCase();
    li.style.display = texto.includes(filtro) ? '' : 'none';
  });
});

cargarUsuarios();
