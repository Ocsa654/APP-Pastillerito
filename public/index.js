// Importar las funciones necesarias de Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getDatabase, ref, push, onValue, remove, set, update } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js';

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
const idCounterRef = ref(database, 'idCounter');

// Inicializar contador si no existe
onValue(idCounterRef, (snapshot) => {
    if (!snapshot.exists()) {
        set(idCounterRef, 1); // Inicializar contador en 1
    }
});

// Referencias a elementos de la interfaz
const inputField = document.getElementById('alarm-time');
const setAlarmButton = document.getElementById('set-alarm-button');
const alarmStatus = document.getElementById('alarm-status');
const alarmList = document.getElementById('alarm-list');

// Configurar alarma
setAlarmButton.addEventListener('click', function () {
    const alarmTime = inputField.value;

    if (alarmTime) {
        // Obtener y actualizar el contador
        onValue(idCounterRef, (snapshot) => {
            if (snapshot.exists()) {
                const newID = snapshot.val();
                const alarmRef = ref(database, `alarms/${newID}`);

                // Guardar la alarma con el nuevo ID
                set(alarmRef, alarmTime)
                    .then(() => {
                        alarmStatus.textContent = `Alarm set for ${alarmTime}.`;
                        inputField.value = ''; // Limpiar campo
                        set(idCounterRef, newID + 1); // Incrementar el contador
                    })
                    .catch((error) => {
                        console.error('Error setting alarm:', error);
                    });
            }
        }, { onlyOnce: true });
    } else {
        alarmStatus.textContent = 'Please set a valid time.';
    }
});

// Monitorear las alarmas en la base de datos
onValue(alarmsInDB, function (snapshot) {
    if (snapshot.exists()) {
        const alarmsArray = Object.entries(snapshot.val()).sort(
            ([idA], [idB]) => idA - idB
        );

        // Limpiar lista actual de alarmas
        clearAlarmList();

        // Iterar por todas las alarmas y mostrar
        alarmsArray.forEach(([alarmID, alarmTime]) => {
            appendAlarmToList(alarmID, alarmTime);
        });
    }
});

// Función para agregar alarma a la lista en la interfaz
function appendAlarmToList(alarmID, alarmTime) {
    const alarmItem = document.createElement('li');
    alarmItem.textContent = `Alarm #${alarmID} at ${alarmTime}`;

    // Agregar un botón para eliminar la alarma
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', function () {
        // Eliminar la alarma de Firebase
        const alarmRef = ref(database, `alarms/${alarmID}`);
        remove(alarmRef)
            .then(() => {
                console.log(`Alarm #${alarmID} removed successfully.`);
                reorderAlarms(); // Reordenar IDs
            })
            .catch((error) => {
                console.error('Error removing alarm:', error);
            });
    });

    alarmItem.appendChild(removeButton);
    alarmList.appendChild(alarmItem);
}

// Función para reordenar las alarmas y sus IDs
function reorderAlarms() {
    onValue(alarmsInDB, (snapshot) => {
        if (snapshot.exists()) {
            const alarmsArray = Object.entries(snapshot.val()).sort(
                ([idA], [idB]) => idA - idB
            );
            const updates = {};
            alarmsArray.forEach(([_, alarmTime], index) => {
                updates[`alarms/${index + 1}`] = alarmTime;
            });

            // Actualizar IDs en Firebase
            update(ref(database), updates)
                .then(() => {
                    console.log('Alarms reordered successfully.');
                    set(idCounterRef, alarmsArray.length + 1); // Actualizar contador
                })
                .catch((error) => {
                    console.error('Error reordering alarms:', error);
                });
        }
    }, { onlyOnce: true });
}

// Función para limpiar la lista de alarmas en la interfaz
function clearAlarmList() {
    alarmList.innerHTML = '';
}
