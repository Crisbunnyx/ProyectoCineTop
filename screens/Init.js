import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, Alert, Modal, TextInput, Animated} from 'react-native';
import { useFonts } from 'expo-font';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ImageBackground } from 'react-native';
import { ScrollView } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import {getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword} from 'firebase/auth'
import { getFirestore, doc, setDoc,getDocs,addDoc, serverTimestamp, onSnapshot, collection, deleteDoc, updateDoc, Timestamp, query, orderBy, limit } from 'firebase/firestore';
import { appFirebase } from '../credentials';
import * as Print from "expo-print";
import * as WebBrowser from "expo-web-browser";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


const db = getFirestore(appFirebase);
const storage = getStorage(appFirebase);

function InitScreen() {
  
  const [openTask, setOpenTask] = useState(false); 
  const [openFunction, setOpenFunction] = useState(false); 
  const [selected, setSelected] = useState(null);

  const funciones = [
    "Duna 2 - 19:30",
    "Joker 2 - 20:15",
    "Venom 3 - 21:00",
  ];
  return (
 /*   <ImageBackground
      source={require('../assets/fondo.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
*/
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.centeredView}>
          <Image source={require('../assets/logoinicio.jpg')} style={styles.logo} />
          <Text style={styles.welcomeText}>Bienvenido a Cine-Top</Text>
          <Text style={styles.subtitle}>Gestiona tus tareas con la mayor facilidad</Text>
        </View>
       
        <View style={styles.table}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setOpenTask(!openTask)}
          >
            <Text style={styles.tableTitle}>
              {selected ? selected : "Tareas Pendientes ▼"}
            </Text>
          </TouchableOpacity>

          {openTask && (
            <View style={styles.dropdown}>
              {funciones.map((item, index) => (

                  <Text style={styles.optionText}>{item}</Text>

              ))}
            </View>
          )}


          <TouchableOpacity
            style={styles.button}
            onPress={() => setOpenFunction(!openFunction)}
          >
            <Text style={styles.tableTitle}>
              {selected ? selected : "Funciones ▼"}
            </Text>
          </TouchableOpacity>

          {openFunction && (
            <View style={styles.dropdown}>
              {funciones.map((item, index) => (
                  <Text style={styles.optionText}>{item}</Text>
              ))}
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
    /*</ImageBackground>*/
  );
}

function SettingScreen(){
 const auth = getAuth(appFirebase);

  const [staff, setStaff] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dni, setDni] = useState("");
  const [names, setNames] = useState("");
  const [surnames, setSurnames] = useState("");
  const [team, setTeam] = useState("");


  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStaff(data);
    });

    return () => unsubscribe();
  }, []);

  const dulceria = staff.filter((user) => user.team?.toLowerCase() === "dulcería");
  const salas = staff.filter((user) => user.team?.toLowerCase() === "salas");

  const handleAddStaff = async () => {
    if (!email || !password || !dni || !names || !surnames || !team) {
      Alert.alert("Campos incompletos", "Por favor rellena todos los campos.");
      return;
    }

    try {
  
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        created_at: serverTimestamp(),
        dni,
        email,
        names,
        surnames,
        role_id: "/roles/fELrFEOUQW8ASc4XW0Pj",
        team,
      });

      Alert.alert("Éxito", "Nuevo staff agregado correctamente.");
      
      setModalVisible(false);

      //Aqui se limpian los campos del form
      setEmail("");
      setPassword("");
      setDni("");
      setNames("");
      setSurnames("");
      setTeam("");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message);
    }
  };

const handleChangeTeam = (userId, team) => {
  if (!team) {
    Alert.alert("Error", "El usuario no tiene un equipo asignado.");
    return;
  }

  const teamLower = team.toLowerCase();
  const newTeam = teamLower === "dulcería" ? "Salas" : "Dulcería";

  Alert.alert(
    "Confirmar cambio de equipo",
    `¿Deseas cambiar a este usuario del equipo ${team} al equipo ${newTeam}?`,
    [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Sí",
        onPress: async () => {
          try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, { team: newTeam });
            await addDoc(collection(db, "notifications"), {
              title: "Cambio de equipo",
              message: `El usuario ${userId} fue movido a ${newTeam}.`,
              created_at: serverTimestamp(),
            });
          } catch (error) {
            console.error("Error al cambiar el equipo:", error);
            Alert.alert("❌ Error", "No se pudo cambiar el equipo.");
          }
        },
      },
    ]
  );
  
};

  return ( 
    <SafeAreaView style={styles.teamContainer}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Text style={styles.teamTitle}>Equipos</Text>

        {/* Equipo Dulcería */}
        <View style={styles.teamCard}>
          <View style={[styles.teamHeader, { backgroundColor: "#d8bff8" }]}>
            <Text style={styles.teamHeaderText}>Equipo Dulcería 🍿</Text>
          </View>

          {dulceria.length > 0 ? (
            dulceria.map((user, index) => (
              <View key={index} style={styles.teamRow}>
                <Text style={styles.teamMember}>
                  {user.names} {user.surnames}
                </Text>
                <View style={styles.teamActions}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => handleChangeTeam(user.id, user.team)}>
                    <Ionicons name="repeat-outline" color="#6d8811" size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noStaffText}>No hay personal registrado.</Text>
          )}
        </View>

        {/* Equipo Salas */}
        <View style={styles.teamCard}>
          <View style={[styles.teamHeader, { backgroundColor: "#cbe8b3" }]}>
            <Text style={styles.teamHeaderText}>Equipo Salas 🧹</Text>
          </View>

          {salas.length > 0 ? (
            salas.map((user, index) => (
              <View key={index} style={styles.teamRow}>
                <Text style={styles.teamMember}>
                  {user.names} {user.surnames}
                </Text>
                <View style={styles.teamActions}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => handleChangeTeam(user.id, user.team)}>
                    <Ionicons name="repeat-outline" color="#6d8811" size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noStaffText}>No hay personal registrado.</Text>
          )}
        </View>

        <View>
          <TouchableOpacity
            style={[styles.timeableButton, styles.timeableCreateButton]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.timeableButtonText}>Agregar Staff</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuevo Staff</Text>

            <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} />
            <TextInput
              placeholder="Contraseña"
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TextInput placeholder="DNI" style={styles.input} value={dni} onChangeText={setDni} />
            <TextInput placeholder="Nombres" style={styles.input} value={names} onChangeText={setNames} />
            <TextInput placeholder="Apellidos" style={styles.input} value={surnames} onChangeText={setSurnames} />
            
            <Text style={styles.modalTitle}>Escoja el equipo del staff</Text>
            {['Dulcería', 'Salas'].map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => setTeam(option)}
                style={{
                  backgroundColor: team === option ? '#6d81f2' : '#e0e0e0',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 20,
                  margin: 6,
                }}
              >
              <Text style={{ color: team === option ? '#fff' : '#000', fontWeight: 'bold' }}>
                {option}
              </Text>
            </TouchableOpacity>
           ))}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleAddStaff}>
                <Text style={styles.confirmText}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function TimeableScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [pendingSchedules, setPendingSchedules] = useState({});
  const [schedulesHistory, setSchedulesHistory] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(1);

  const weekDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const hourOptions = [7, 7.5, 8, 8.5, 9, 9.5, 10];
  const startTimes = [
    "09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30",
    "13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30",
    "17:00","17:30",
  ]; // 9:00 → 00:30 max

  // 🔹 Cargar staff desde Firestore
  useEffect(() => {
    const fetchStaff = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStaffList(users);
    };
    fetchStaff();
  }, []);

  // 🔹 Cargar historial (solo 6 más recientes)
  useEffect(() => {
    const fetchSchedules = async () => {
      const snapshot = await getDocs(query(collection(db, "schedules"), orderBy("created_at", "desc"), limit(6)));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSchedulesHistory(data);
    };
    fetchSchedules();
  }, []);

  // 🔹 Calcular total semanal de horas
  const getTotalWeeklyHours = (staffId) => {
    const staffSchedule = pendingSchedules[staffId] || {};
    return Object.values(staffSchedule).reduce((sum, d) => sum + (d?.hours || 0), 0);
  };

  // 🔹 Seleccionar horas para el día
  const handleSelectHours = (day, hours) => {
    const current = pendingSchedules[selectedStaff.id]?.[day] || {};
    const currentTotal = getTotalWeeklyHours(selectedStaff.id);
    const previousHours = current.hours || 0;
    const newTotal = currentTotal - previousHours + hours;

    if (newTotal > 44) {
      Alert.alert("⚠️ Límite de horas", "El total semanal no puede exceder 44 horas.");
      return;
    }

    setPendingSchedules((prev) => ({
      ...prev,
      [selectedStaff.id]: {
        ...(prev[selectedStaff.id] || {}),
        [day]: { ...current, hours },
      },
    }));
  };

  // 🔹 Seleccionar hora de inicio
  const handleSelectStartTime = (day, start) => {
    const current = pendingSchedules[selectedStaff.id]?.[day] || {};
    if (!current.hours) {
      Alert.alert("Selecciona primero la cantidad de horas para este día.");
      return;
    }

    // Verificar que la hora de salida no exceda 00:30
    const [h, m] = start.split(":").map(Number);
    const endMinutes = h * 60 + m + current.hours * 60;
    if (endMinutes > 24.5 * 60) {
      Alert.alert("⏰ Límite de horario", "El horario de salida no puede ser después de las 00:30.");
      return;
    }

    setPendingSchedules((prev) => ({
      ...prev,
      [selectedStaff.id]: {
        ...(prev[selectedStaff.id] || {}),
        [day]: { ...current, start },
      },
    }));
  };

  // 🔹 Guardar horario temporal
  const handleSaveStaffSchedule = () => {
    if (!selectedStaff) return;
    const total = getTotalWeeklyHours(selectedStaff.id);
    if (total === 0) {
      Alert.alert("⚠️ Incompleto", "Debes asignar al menos un día de trabajo antes de guardar.");
      return;
    }
    Alert.alert("✅ Guardado", `Horario de ${selectedStaff.names} guardado (${total}h semanales).`);
  };

  // 🔹 Guardar todos en Firebase
  const handleCreateAllPDF = async () => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial; padding: 20px; }
            h1 { text-align: center; color: #333; }
            h2 { margin-top: 20px; color: #007bff; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #888; padding: 8px; text-align: center; }
            th { background-color: #f0f0f0; }
          </style>
        </head>
        <body>
          <h1>Horario Semana ${selectedWeek}</h1>
          ${staffList
            .filter((s) => pendingSchedules[s.id])
            .map((s) => {
              const total = getTotalWeeklyHours(s.id);
              return `
                <h2>${s.names} ${s.surnames} (${total}h/semana)</h2>
                <table>
                  <tr><th>Día</th><th>Inicio</th><th>Duración (h)</th><th>Fin</th></tr>
                  ${weekDays
                    .map((day) => {
                      const d = pendingSchedules[s.id][day];
                      if (!d)
                        return `<tr><td>${day}</td><td>-</td><td>-</td><td>-</td></tr>`;
                      const [h, m] = d.start.split(":").map(Number);
                      const endMinutes = h * 60 + m + d.hours * 60;
                      const endH = Math.floor(endMinutes / 60) % 24;
                      const endM = endMinutes % 60;
                      const endLabel = `${endH.toString().padStart(2, "0")}:${endM === 0 ? "00" : "30"}`;
                      return `<tr><td>${day}</td><td>${d.start}</td><td>${d.hours}</td><td>${endLabel}</td></tr>`;
                    })
                    .join("")}
                </table>`;
            })
            .join("")}
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const blob = await (await fetch(uri)).blob();
      const pdfRef = ref(storage, `schedules/Horario_Semana_${selectedWeek}.pdf`);
      await uploadBytes(pdfRef, blob);
      const downloadURL = await getDownloadURL(pdfRef);

      await addDoc(collection(db, "schedules"), {
        week: `Semana ${selectedWeek}`,
        pdf_url: downloadURL,
        created_at: serverTimestamp(),
      });

      Alert.alert("✅ Éxito", "Horarios guardados correctamente.");
      setModalVisible(false);
    } catch (error) {
      console.error("Error creando PDF:", error);
      Alert.alert("❌ Error", "No se pudo crear el PDF.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
      <ScrollView>
        <Text style={{ fontSize: 22, fontWeight: "bold", textAlign: "center", marginTop: 20 }}>
          Historial de Horarios
        </Text>

        {/* Historial (máx 6) */}
        <View style={{ paddingHorizontal: 20, marginTop: 15 }}>
          {schedulesHistory.length > 0 ? (
            schedulesHistory.slice(0, 6).map((item, index) => (
              <View key={index} style={{
                flexDirection: "row", justifyContent: "space-between", alignItems: "center",
                backgroundColor: "#fff", padding: 10, borderRadius: 10, marginBottom: 8, elevation: 2,
              }}>
                <Text>{item.week}</Text>
                <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync(item.pdf_url)}>
                  <Ionicons name="eye-outline" size={22} color="#92ad16" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={{ textAlign: "center", color: "#777" }}>No hay horarios creados aún.</Text>
          )}
        </View>

        {/* Botón crear */}
        <TouchableOpacity
          style={{
            flexDirection: "row", alignItems: "center", justifyContent: "center",
            margin: 20, backgroundColor: "#007bff", paddingVertical: 10, borderRadius: 10,
          }}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Crear Horario</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={{
          flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center",
        }}>
          <View style={{
            backgroundColor: "#fff", borderRadius: 15, padding: 20, width: "90%", maxHeight: "90%",
          }}>
            <ScrollView>
              <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10 }}>
                🗓 Crear Horario
              </Text>

              {/* Semana */}
              <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 10 }}>
                <TouchableOpacity onPress={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}>
                  <Ionicons name="remove-circle-outline" size={28} color="#007bff" />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, marginHorizontal: 15 }}>Semana {selectedWeek}</Text>
                <TouchableOpacity onPress={() => setSelectedWeek(selectedWeek + 1)}>
                  <Ionicons name="add-circle-outline" size={28} color="#007bff" />
                </TouchableOpacity>
              </View>

              {/* Staff */}
              <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Selecciona Staff:</Text>
              {staffList.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={{
                    padding: 10,
                    backgroundColor: selectedStaff?.id === s.id ? "#cde5ff" : "#f4f4f4",
                    borderRadius: 8,
                    marginBottom: 5,
                  }}
                  onPress={() => setSelectedStaff(s)}
                >
                  <Text>{s.names} {s.surnames}</Text>
                </TouchableOpacity>
              ))}

              {/* Horario del staff */}
              {selectedStaff && (
                <>
                  <Text style={{ fontWeight: "bold", marginTop: 10 }}>
                    Horario de {selectedStaff.names}
                  </Text>

                  {weekDays.map((day) => (
                    <View key={day} style={{ marginBottom: 15 }}>
                      <Text style={{ marginBottom: 5, color: "blue", fontWeight: "bold"}}>{day}</Text>
                      <Text style={{ marginBottom: 5 }}>Selecciona la cantidad de horas de trabajo </Text>

                      {/* Seleccionar horas */}
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {hourOptions.map((hours) => (
                          
                          <TouchableOpacity
                            key={`${day}-${hours}`}
                            style={{
                              backgroundColor:
                                pendingSchedules[selectedStaff.id]?.[day]?.hours === hours
                                  ? "#007bff"
                                  : "#e0e0e0",
                              padding: 8,
                              borderRadius: 6,
                              marginRight: 5,
                            }}
                            onPress={() => handleSelectHours(day, hours)}
                          >
                            <Text>{hours}h</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                      

                      {/* Seleccionar inicio */}
                      <Text style={{ marginTop: 2 }}>Selecciona hora de entrada </Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {startTimes.map((start) => (
                          <TouchableOpacity
                            key={`${day}-${start}`}
                            style={{
                              backgroundColor:
                                pendingSchedules[selectedStaff.id]?.[day]?.start === start
                                  ? "#92ad16"
                                  : "#e0e0e0",
                              padding: 8,
                              borderRadius: 6,
                              marginRight: 5,
                              marginTop: 5,
                            }}
                            onPress={() => handleSelectStartTime(day, start)}
                          >
                            <Text>{start}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  ))}

                  <TouchableOpacity
                    style={{
                      backgroundColor: "#28a745",
                      padding: 10,
                      borderRadius: 8,
                      alignItems: "center",
                      marginTop: 10,
                    }}
                    onPress={handleSaveStaffSchedule}
                  >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>Guardar este Staff</Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                style={{
                  backgroundColor: "#007bff",
                  padding: 10,
                  borderRadius: 8,
                  alignItems: "center",
                  marginTop: 15,
                }}
                onPress={handleCreateAllPDF}
              >
                <Ionicons name="document-text-outline" size={18} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Guardar Todos en Firebase</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  marginTop: 10,
                  backgroundColor: "#ccc",
                  padding: 10,
                  borderRadius: 8,
                  alignItems: "center",
                }}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ fontWeight: "bold" }}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ProfileScreen() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [localNames, setLocalNames] = useState("");
  const [localSurnames, setLocalSurnames] = useState("");

  // 🔹 Obtener los datos del usuario desde Firestore
useEffect(() => {
  if (!user) {
    console.log("❌ No hay usuario autenticado.");
    return;
  }

  const unsubscribe = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      setUserData(data);
      setLocalNames(data.names || "");
      setLocalSurnames(data.surnames || "");
    } else {
      console.log("⚠️ No se encontró el usuario en Firestore.@");
    }
  });

  return () => unsubscribe();
}, [user]);

  // 🔹 Guardar cambios
  const handleSave = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        names: localNames,
        surnames: localSurnames,
      });
      Alert.alert("✅ Perfil actualizado", "Los cambios se guardaron correctamente.");
      setEditing(false);
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      Alert.alert("❌ Error", "No se pudo guardar el perfil.");
    }
  };

  // 🔹 Cancelar edición
  const handleCancel = () => {
    if (userData) {
      setLocalNames(userData.names || "");
      setLocalSurnames(userData.surnames || "");
    }
    setEditing(false);
  };

  // 🔹 Cerrar sesión
  const handleLogout = async () => {
    try {
      await auth.signOut();
      Alert.alert("👋 Sesión cerrada", "Has cerrado sesión correctamente.");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // 🔹 Mostrar mensaje de carga mientras se obtienen los datos
  if (!userData) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text>Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { padding: 20 }]}>
      <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}>
        <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 20 }}>👤 Perfil</Text>

        {/* Imagen por defecto 
        <Image
          source={require("../assets/default_user.png")}
          style={{
            width: 130,
            height: 130,
            borderRadius: 65,
            marginBottom: 15,
            borderWidth: 3,
            borderColor: "#007bff",
          }}
        />*/}

        {/* Datos de usuario */}
        <View style={{ width: "100%", marginTop: 10 }}>
          <Text style={styles.profileLabel}>Nombre</Text>
          {editing ? (
            <TextInput
              style={styles.profileInput}
              value={localNames}
              onChangeText={setLocalNames}
            />
          ) : (
            <Text style={styles.profileInfoText}>{userData.names}</Text>
          )}

          <Text style={styles.profileLabel}>Apellidos</Text>
          {editing ? (
            <TextInput
              style={styles.profileInput}
              value={localSurnames}
              onChangeText={setLocalSurnames}
            />
          ) : (
            <Text style={styles.profileInfoText}>{userData.surnames}</Text>
          )}

          <Text style={styles.profileLabel}>Correo</Text>
          <Text style={styles.profileInfoText}>{userData.email}</Text>

          <Text style={styles.profileLabel}>DNI</Text>
          <Text style={styles.profileInfoText}>{userData.dni}</Text>

          <Text style={styles.profileLabel}>Equipo</Text>
          <Text style={styles.profileInfoText}>{userData.team || "Sin asignar"}</Text>
        </View>

        {/* Botones */}
        {editing ? (
          <View style={{ flexDirection: "row", marginTop: 20 }}>
            <TouchableOpacity
              style={[styles.profileButton, { backgroundColor: "#28a745" }]}
              onPress={handleSave}
            >
              <Text style={styles.profileButtonText}>Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.profileButton, { backgroundColor: "#dc3545" }]}
              onPress={handleCancel}
            >
              <Text style={styles.profileButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.profileButton, { backgroundColor: "#007bff", width: 200 }]}
              onPress={() => setEditing(true)}
            >
              <Ionicons name="create-outline" color="#fff" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.profileButtonText}>Editar Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.profileButton, { backgroundColor: "#6c757d", marginTop: 15, width: 200 }]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" color="#fff" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.profileButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


function TaskScreen() {
  const [openSection, setOpenSection] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // 🔹 Definición de tareas
  const tareas = {
    Limpieza: [
      "Limpieza Camarines",
      "Limpieza Baños",
      "Limpieza Lobby",
      "Limpieza Boletería",
      "Limpieza Salón de Eventos",
    ],
    Confitería: [
      "Limpieza Mesón",
      "Limpieza Trampa de Grasa",
      "Limpieza Máquinas de Nachos",
      "Limpieza Filtros Palomeras",
      "Limpieza Refrigeradores",
      "Limpieza Máquinas de Bebidas",
      "Pre Elaboración de Hot Dogs",
      "Limpieza Rack de Jarabes",
      "Calibración Quesera",
      "Calibración Palomeras",
      "Boquillas de Bebida",
      "Limpieza Cuarto de Basura",
      "Limpieza Exhibidor de Nachos",
      "Limpieza Vitrinas",
      "Limpieza Cooler de Helados",
      "Limpieza Azulejos TrasTienda",
      "Limpieza Azulejos Dulcería",
    ],
    "Gestión ADM": ["Contratación de Staff", "Revisar Stock de Productos"],
  };

  // 🔹 Cargar staff desde Firestore
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStaffList(data);
      } catch (error) {
        console.error("Error cargando staff:", error);
      }
    };
    fetchStaff();
  }, []);

  const handleToggle = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleSelectTask = (task, section) => {
    setSelectedTask({ name: task, category: section });
    setModalVisible(true);
  };

  // 🔹 Asignar tarea al usuario seleccionado
  const handleAssignTask = async () => {
    if (!selectedTask || !selectedStaff) {
      Alert.alert("⚠️ Faltan datos", "Selecciona una tarea y un miembro del staff.");
      return;
    }

    try {
      await addDoc(collection(db, "assigned_tasks"), {
        task_name: selectedTask.name,
        task_category: selectedTask.category,
        assigned_to: selectedStaff.id,
        staff_name: `${selectedStaff.names} ${selectedStaff.surnames}`,
        created_at: serverTimestamp(),
      });

      Alert.alert(
        "✅ Tarea asignada",
        `${selectedTask.name} fue asignada a ${selectedStaff.names} ${selectedStaff.surnames}`
      );
      setSelectedTask(null);
      setSelectedStaff(null);
      setModalVisible(false);
    } catch (error) {
      console.error("Error asignando tarea:", error);
      Alert.alert("❌ Error", "No se pudo asignar la tarea.");
    }
  };

  // 🔹 Filtrar staff según tipo de tarea
  const getFilteredStaff = () => {
  if (!selectedTask) return [];

  // 🔸 Tareas de Confitería → solo equipo Dulcería
  if (selectedTask.category === "Confitería") {
    return staffList.filter(
      (u) => u.team?.toLowerCase() === "dulcería"
    );
  }

  // 🔸 Tareas de Gestión ADM → solo administradores
  if (selectedTask.category === "Gestión ADM") {
    return staffList.filter((u) => {
      // role_id puede ser string o referencia
      const rolePath = typeof u.role_id === "string"
        ? u.role_id
        : u.role_id?.path || ""; // si es referencia
      return rolePath.includes("4O38c3nZcIZ2tgnq6ZiV"); // ID del rol admin
    });
  }

  // 🔸 Tareas de Limpieza → todos los usuarios
  return staffList;
};
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
      <ScrollView style={{ padding: 20 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          Asignación de Tareas
        </Text>

        {/* Secciones de tareas */}
        {Object.entries(tareas).map(([seccion, items], index) => (
          <View key={index} style={{ marginBottom: 16 }}>
            <TouchableOpacity
              style={{
                backgroundColor: "#007bff",
                padding: 12,
                borderRadius: 8,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onPress={() => handleToggle(seccion)}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                {seccion}
              </Text>
              <Ionicons
                name={openSection === seccion ? "chevron-up" : "chevron-down"}
                size={20}
                color="#fff"
              />
            </TouchableOpacity>

            {/* Dropdown */}
            {openSection === seccion && (
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 8,
                  marginTop: 6,
                  elevation: 2,
                  paddingVertical: 6,
                }}
              >
                {items.map((tarea, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handleSelectTask(tarea, seccion)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderBottomWidth: i < items.length - 1 ? 1 : 0,
                      borderBottomColor: "#eee",
                      backgroundColor:
                        selectedTask?.name === tarea ? "#d1e7dd" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        color:
                          selectedTask?.name === tarea ? "#0f5132" : "#212529",
                        fontWeight:
                          selectedTask?.name === tarea ? "600" : "400",
                      }}
                    >
                      {tarea}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Modal de asignación */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 15,
              padding: 20,
              width: "90%",
              maxHeight: "80%",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              Asignar: {selectedTask?.name}
            </Text>

            <ScrollView>
              {getFilteredStaff().length > 0 ? (
                getFilteredStaff().map((staff) => (
                  <TouchableOpacity
                    key={staff.id}
                    onPress={() => setSelectedStaff(staff)}
                    style={{
                      padding: 10,
                      backgroundColor:
                        selectedStaff?.id === staff.id
                          ? "#cde5ff"
                          : "#f4f4f4",
                      borderRadius: 8,
                      marginBottom: 5,
                    }}
                  >
                    <Text>
                      {staff.names} {staff.surnames} - {staff.team}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={{ textAlign: "center", color: "#777" }}>
                  No hay personal disponible para esta tarea.
                </Text>
              )}
            </ScrollView>

            <TouchableOpacity
              style={{
                backgroundColor: "#007bff",
                padding: 10,
                borderRadius: 8,
                alignItems: "center",
                marginTop: 10,
              }}
              onPress={handleAssignTask}
            >
              <Ionicons
                name="checkmark-done-outline"
                size={20}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Confirmar Asignación
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                marginTop: 10,
                backgroundColor: "#ccc",
                padding: 10,
                borderRadius: 8,
                alignItems: "center",
              }}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ fontWeight: "bold" }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function TeatherScreen() {
  const [funciones, setFunciones] = useState([]);
  const [selectedFuncion, setSelectedFuncion] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "movie_showing"), (snapshot) => {
      const hoy = new Date().toLocaleDateString("es-CL", { timeZone: "America/Santiago" });

      const data = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((item) => {
          if (!item.hour_init) return false;
          const fechaInit = item.hour_init.toDate ? item.hour_init.toDate() : new Date(item.hour_init);
          const fechaTexto = fechaInit.toLocaleDateString("es-CL", { timeZone: "America/Santiago" });
          return fechaTexto === hoy;
        })
        .sort((a, b) => {
          const aDate = a.hour_init?.toDate ? a.hour_init.toDate() : new Date(a.hour_init);
          const bDate = b.hour_init?.toDate ? b.hour_init.toDate() : new Date(b.hour_init);
          return aDate - bDate;
        });

      setFunciones(data);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenModal = (funcion) => {
    setSelectedFuncion(funcion);
    setModalVisible(true);
    setConfirming(false);
  };

  const formatHour = (timestamp) => {
    if (!timestamp) return "Sin hora";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString("es-CL", {
      timeZone: "America/Santiago",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleConfirmCleaning = async () => {
    if (!selectedFuncion) return;
    try {
      const ref = doc(db, "movie_showing", selectedFuncion.id);
      await updateDoc(ref, { cleanliness_status: true });
      setSelectedFuncion({ ...selectedFuncion, cleanliness_status: true });
      setConfirming(false);
      alert("✅ Sala marcada como terminada.");
    } catch (error) {
      console.error("Error al actualizar limpieza:", error);
      alert("❌ Error al actualizar el estado.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10 }}>
          Funciones del Día
        </Text>

        {/* Encabezado */}
        <View style={styles.teatherHeaderRow}>
          <Text style={[styles.teatherHeaderText, { width: "25%" }]}>Sala</Text>
          <Text style={[styles.teatherHeaderText, { width: "45%" }]}>Horario</Text>
          <Text style={[styles.teatherHeaderText, { width: "30%" }]}>Limpieza</Text>
        </View>

        {/* Filas */}
        {funciones.length > 0 ? (
          funciones.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={styles.teatherRow}
              onPress={() => handleOpenModal(f)}
            >
              <Text style={{ width: "25%", textAlign: "center" }}>Sala {f.theater}</Text>
              <Text style={{ width: "45%", textAlign: "center" }}>
                {f.hour_init && f.hour_end
                  ? `${formatHour(f.hour_init)} - ${formatHour(f.hour_end)}`
                  : "Sin horario"}
              </Text>
              <MaterialIcons
                name={f.cleanliness_status ? "check-circle" : "cancel"}
                size={24}
                color={f.cleanliness_status ? "green" : "red"}
              />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={{ textAlign: "center", marginTop: 20, color: "#777" }}>
            No hay funciones para hoy.
          </Text>
        )}

        {/* Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.teatherModalOverlay}>
            <View style={styles.teatherModalContent}>
              {selectedFuncion && (
                <>
                  <Text style={styles.teatherModalTitle}>🎬 Detalle de Función</Text>
                  <View style={styles.teatherDetailBox}>
                    <Text style={styles.teatherDetailText}>
                      Sala: <Text style={styles.teatherBold}>{selectedFuncion.theater}</Text>
                    </Text>
                    <Text style={styles.teatherDetailText}>
                      Película: <Text style={styles.teatherBold}>{selectedFuncion.movie}</Text>
                    </Text>
                    <Text style={styles.teatherDetailText}>
                      Horario:{" "}
                      <Text style={styles.teatherBold}>
                        {formatHour(selectedFuncion.hour_init)} - {formatHour(selectedFuncion.hour_end)}
                      </Text>
                    </Text>
                    <Text style={styles.teatherDetailText}>
                      Público total: <Text style={styles.teatherBold}>{selectedFuncion.people || 0}</Text>
                    </Text>
                    <Text style={styles.teatherDetailText}>
                      Limpieza:{" "}
                      {selectedFuncion.cleanliness_status ? "✅ Limpia" : "❌ Pendiente"}
                    </Text>
                  </View>

                  {/* Botones */}
                  <View style={styles.teatherModalButtons}>
                    <TouchableOpacity
                      style={[styles.teatherButton, styles.teatherCancelButton]}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.teatherCancelText}>Cerrar</Text>
                    </TouchableOpacity>

                    {!selectedFuncion.cleanliness_status && !confirming && (
                      <TouchableOpacity
                        style={[styles.teatherButton, styles.teatherConfirmButton]}
                        onPress={() => setConfirming(true)}
                      >
                        <Text style={styles.teatherConfirmText}>Sala Terminada</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Confirmación */}
                  {confirming && (
                    <View style={styles.teatherConfirmBox}>
                      <Text style={styles.teatherConfirmMessage}>
                        ¿Estás confirmando que la sala está terminada?
                      </Text>
                      <View style={styles.teatherConfirmButtons}>
                        <TouchableOpacity
                          style={[styles.teatherButton, styles.teatherYesButton]}
                          onPress={handleConfirmCleaning}
                        >
                          <Text style={styles.teatherButtonText}>Sí</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.teatherButton, styles.teatherNoButton]}
                          onPress={() => setConfirming(false)}
                        >
                          <Text style={styles.teatherButtonText}>No</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

function NotificationPanel({ visible, onClose }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!visible) return;
    const unsubscribe = onSnapshot(
      query(collection(db, "notifications"), orderBy("created_at", "desc")),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(data);
      }
    );
    return () => unsubscribe();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "flex-start",
          alignItems: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            width: "80%",
            maxHeight: "70%",
            marginTop: 80,
            marginRight: 10,
            borderRadius: 12,
            padding: 15,
            elevation: 5,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
            🔔 Notificaciones
          </Text>

          {notifications.length > 0 ? (
            <ScrollView>
              {notifications.map((n) => (
                <View
                  key={n.id}
                  style={{
                    backgroundColor: "#f8f9fa",
                    borderRadius: 8,
                    padding: 10,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontWeight: "bold", color: "#333" }}>
                    {n.title}
                  </Text>
                  <Text style={{ color: "#555", marginTop: 3 }}>{n.message}</Text>
                  <Text style={{ color: "#aaa", fontSize: 12, marginTop: 4 }}>
                    {n.created_at?.toDate
                      ? n.created_at.toDate().toLocaleString("es-CL")
                      : "Fecha desconocida"}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={{ textAlign: "center", color: "#777" }}>
              No hay notificaciones aún.@
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}


const Tab = createBottomTabNavigator()

export default function Initial() {
  const [fontsLoaded] = useFonts({
    Marker: require("../fonts/PermanentMarker-Regular.ttf"),
  });

  const [notifVisible, setNotifVisible] = useState(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#FFF8E1",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontFamily: "Marker",
            fontSize: 30,
            color: "#212121",
          },
          tabBarStyle: {
            backgroundColor: "#222",
          },
          tabBarActiveTintColor: "#ff6347",
          tabBarInactiveTintColor: "#888",
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 15 }}
              onPress={() => setNotifVisible(true)}
            >
              <Ionicons
                name="notifications-outline"
                size={26}
                color="#212121"
              />
            </TouchableOpacity>
          ),
        }}
      >
        <Tab.Screen
          name="Inicio"
          component={InitScreen}
          options={{
            title: "Inicio",
            tabBarIcon: () => (
              <Ionicons name="home-outline" size={24} color={"white"} />
            ),
          }}
        />

        <Tab.Screen
          name="Horarios"
          component={TimeableScreen}
          options={{
            title: "Horarios",
            tabBarIcon: () => (
              <Ionicons name="book-outline" size={24} color={"white"} />
            ),
          }}
        />

        <Tab.Screen
          name="Equipos"
          component={SettingScreen}
          options={{
            tabBarIcon: () => (
              <Ionicons name="people-outline" size={24} color={"white"} />
            ),
          }}
        />

        <Tab.Screen
          name="Salas"
          component={TeatherScreen}
          options={{
            tabBarIcon: () => (
              <Ionicons name="browsers-outline" size={24} color={"white"} />
            ),
          }}
        />

        <Tab.Screen
          name="Tareas"
          component={TaskScreen}
          options={{
            tabBarIcon: () => (
              <Ionicons name="newspaper-outline" size={24} color={"white"} />
            ),
          }}
        />

        <Tab.Screen
          name="Perfil"
          component={ProfileScreen}
          options={{
            tabBarIcon: () => (
              <Ionicons name="person-outline" size={24} color={"white"} />
            ),
          }}
        />
      </Tab.Navigator>

      {/* 🔔 Panel de notificaciones */}
      <NotificationPanel
        visible={notifVisible}
        onClose={() => setNotifVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor:'#f4f6f6',
    flex: 1
  },

  Tab:{
    backgroundColor:'black',
    color: 'red',
  },


  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },


  logo: {
    width: 220,
    height: 220,
    marginBottom: 40,
    borderRadius: 10,
  },

  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#080808ff',
    marginBottom: 10,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 16,
    color: '#2196f3',
    marginBottom: 40,
    textAlign: 'center',
    paddingHorizontal: 20,
    fontFamily:'Marker',
  },

  overlay: {
  ...StyleSheet.absoluteFillObject, 
  backgroundColor: 'rgba(0, 0, 0, 0.1)', 
  zIndex: 1,
},

table: {
  backgroundColor: '#fff',
  borderColor: '#696969',
  borderWidth: 2,
  marginHorizontal: 20,
  borderRadius: 10,
  padding: 15,
  marginBottom: 20,
},

tableTitle: {
  fontFamily: 'Marker',
  backgroundColor: '#D8BFD8',
  color: 'black',
  fontSize: 20,
  borderRadius: 8,
  padding: 10,
  textAlign: 'center',
  marginBottom: 10,
},

tableContent: {
  gap: 20,
},

taskList: {
  color: 'black',
  fontSize: 14,
  fontWeight: 'bold',
  textAlign: 'left',
},

warning: {
  color: 'black',
  fontSize: 16,
  fontWeight: 'bold',
  textAlign: 'center',
  paddingTop: 10,
},

boxTeam:{
    backgroundColor: '#dbf7ebff',
    borderRadius: 10,
    width: 300,
    height: 300,
    marginTop: 10,
    marginLeft: 35,
    marginRight: 35,
    marginBottom: 10,

  },

team:{
    backgroundColor: '#eaeef7ff',
    borderRadius: 20,
    borderColor: '#696969',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 65,
    marginBottom: 20,
    fontWeight: 'bold',
    height: 40,
    width: 170,

  },

  textTeam:{
    fontSize: 18,
    fontWeight: 'bold',
    color:'black',

  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nameText: {
    flex: 1,
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginRight: 10,
  },
  iconButton: {
    marginLeft: 10,
  },

    boxButton:{
    backgroundColor: '#525fe1',
    borderRadius: 30,
    paddingVertical: 20,
    width: 150,
    marginTop: 20,
  },

    timeableContainer: {
    flex: 1,
    backgroundColor: '#f4f6f6',
    padding: 20,
  },
  timeableTitle: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 25,
    color: '#2b2d42',
  },
  timeableList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  timeableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#e3e3e3',
  },
  timeableName: {
    fontSize: 16,
    color: '#333',
  },
  timeableIconButton: {
    backgroundColor: '#f2f8e4',
    padding: 8,
    borderRadius: 10,
  },
  timeableButtonsContainer: {
    marginTop: 30,
    gap: 15,
  },
  timeableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#92ad16',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#92ad16',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  timeableCreateButton: {
    backgroundColor: '#6d8811',
  },
  timeableButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

    teamContainer: {
    flex: 1,
    backgroundColor: '#f4f6f6',
    padding: 20,
  },
  teamTitle: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 25,
    color: '#2b2d42',
  },
  teamCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  teamHeader: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  teamHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    fontFamily: 'Marker',
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderColor: '#e6e6e6',
  },
  teamMember: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  teamActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#f1f3f5',
    padding: 8,
    borderRadius: 10,
  },

  teatherContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    elevation: 4, // sombra Android
    shadowColor: "#000", // sombra iOS
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  teatherTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  teatherScrollArea: {
    maxHeight: 400, // puedes ajustar esto
  },
  teatherRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  teatherText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: "#5d48d3ff",
  },
  hourText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: "#333333ff",
  },

  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '85%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginBottom: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  cancelButton: { padding: 10 },
  confirmButton: { padding: 10 },
  cancelText: { color: '#e64c3c', fontWeight: 'bold' },
  confirmText: { color: '#6c63ff', fontWeight: 'bold' },

  teatherHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#e9ecef",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  teatherHeaderText: {
    textAlign: "center",
    fontWeight: "600",
  },
  teatherRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  teatherModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  teatherModalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    elevation: 5,
  },
  teatherModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#333",
  },
  teatherDetailBox: {
    backgroundColor: "#f6f8fa",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  teatherDetailText: {
    fontSize: 16,
    marginBottom: 6,
  },
  teatherBold: {
    fontWeight: "600",
    color: "#111",
  },
  teatherModalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  teatherButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  teatherCancelButton: {
    backgroundColor: "#e0e0e0",
  },
  teatherConfirmButton: {
    backgroundColor: "#007bff",
  },
  teatherConfirmText: {
    color: "#fff",
    fontWeight: "bold",
  },
  teatherCancelText: {
    color: "#333",
    fontWeight: "bold",
  },
  teatherConfirmBox: {
    marginTop: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  teatherConfirmMessage: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 10,
  },
  teatherConfirmButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  teatherYesButton: {
    backgroundColor: "green",
  },
  teatherNoButton: {
    backgroundColor: "red",
  },
  teatherButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

    scheduleContainer: { flex: 1, backgroundColor: "#f8f9fa", padding: 15 },
  scheduleTitle: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 15 },
  scheduleList: { marginBottom: 20 },
  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 8,
    borderRadius: 10,
    elevation: 2,
  },
  scheduleName: { fontSize: 16, fontWeight: "500" },
  scheduleIconButton: { padding: 6 },
  scheduleButtonsContainer: { alignItems: "center" },
  scheduleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#92ad16",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  scheduleCreateButton: { backgroundColor: "#007bff" },
  scheduleButtonText: { color: "#fff", fontWeight: "bold" },

  // MODAL
  scheduleModalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  scheduleModalContent: { backgroundColor: "#fff", width: "90%", borderRadius: 12, padding: 15, maxHeight: "90%" },
  scheduleModalTitle: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  scheduleLabel: { fontSize: 16, fontWeight: "600", marginVertical: 5 },
  scheduleStaffButton: { padding: 10, borderRadius: 8, backgroundColor: "#f1f1f1", marginBottom: 6 },
  scheduleStaffButtonSelected: { backgroundColor: "#007bff" },
  scheduleStaffText: { textAlign: "center", color: "#333" },
  scheduleDayRow: { marginBottom: 10 },
  scheduleDayText: { fontSize: 16, fontWeight: "500", marginBottom: 4 },
  scheduleHourButton: {
    backgroundColor: "#eaeaea",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginRight: 6,
  },
  scheduleHourButtonSelected: { backgroundColor: "#007bff" },
  scheduleHourText: { color: "#333" },
  scheduleGenerateButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  scheduleGenerateText: { color: "#fff", fontWeight: "bold" },

    profileLabel: {
    fontWeight: "bold",
    color: "#007bff",
    marginTop: 10,
  },
  profileInfoText: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 6,
  },
  profileInput: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 6,
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  profileButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
})