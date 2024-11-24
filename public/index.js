// Importar las funciones necesarias de Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getDatabase, ref, push, onValue, remove } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js';

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCrGlKaM7KqkidxCROJoI6NLZutknlRj2E",
    authDomain: "pastillerito-5e274.firebaseapp.com",
    databaseURL: "https://pastillerito-5e274-default-rtdb.firebaseio.com",
    projectId: "pastillerito-5e274",
    storageBucket: "pastillerito-5e274.appspot.com",
    messagingSenderId: "79478299190",
    appId: "1:79478299190:web:e79376671482f8ac16d697"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const alarmsInDB = ref(database, 'alarms');

// Referencias a elementos de la interfaz
const inputField = document.getElementById('alarm-time');
const setAlarmButton = document.getElementById('set-alarm-button');
const alarmStatus = document.getElementById('alarm-status');
const alarmList = document.getElementById('alarm-list');

// Configurar alarma
setAlarmButton.addEventListener('click', function () {
    const alarmTime = inputField.value;

    if (alarmTime) {
        // Guardar la hora de la alarma en Firebase
        push(alarmsInDB, alarmTime);
        alarmStatus.textContent = `Alarm set for ${alarmTime}.`;

        // Limpiar campo de entrada
        inputField.value = '';
    } else {
        alarmStatus.textContent = 'Please set a valid time.';
    }
});

// Monitorear las alarmas en la base de datos
onValue(alarmsInDB, function (snapshot) {
    if (snapshot.exists()) {
        const alarmsArray = Object.entries(snapshot.val());

        // Limpiar lista actual de alarmas
        clearAlarmList();

        // Iterar por todas las alarmas y mostrar
        alarmsArray.forEach(([alarmID, alarmTime]) => {
            // Mostrar cada alarma en la lista
            appendAlarmToList(alarmID, alarmTime);

            // Verificar si es hora de activar la alarma
            const alarmDate = new Date();
            const [hours, minutes] = alarmTime.split(':').map(Number);
            alarmDate.setHours(hours, minutes, 0, 0);

            if (isAlarmTime(alarmDate)) {
                alert(`ALARM: Time's up! It's now ${alarmTime}.`);
                // Eliminar la alarma después de que se active
                const alarmRef = ref(database, `alarms/${alarmID}`);
                remove(alarmRef);
            }
        });
    }
});

// Función para verificar si es hora de activar la alarma
function isAlarmTime(alarmDate) {
    const currentDate = new Date();
    return (
        currentDate.getHours() === alarmDate.getHours() &&
        currentDate.getMinutes() === alarmDate.getMinutes()
    );
}

// Función para agregar alarma a la lista en la interfaz
function appendAlarmToList(alarmID, alarmTime) {
    const alarmItem = document.createElement('li');
    alarmItem.textContent = `Alarm at ${alarmTime}`;

    // Agregar un botón para eliminar la alarma
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', function () {
        // Usar alarmID para eliminar la alarma correcta de Firebase
        const alarmRef = ref(database, `alarms/${alarmID}`);
        remove(alarmRef)
            .then(() => {
                console.log(`Alarm at ${alarmTime} removed successfully.`);
            })
            .catch((error) => {
                console.error('Error removing alarm:', error);
            });
    });

    alarmItem.appendChild(removeButton);
    alarmList.appendChild(alarmItem);
}

// Función para limpiar la lista de alarmas en la interfaz
function clearAlarmList() {
    alarmList.innerHTML = '';
}
