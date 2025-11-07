import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigator from './navigation/MainNavigator';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import 'react-native-gesture-handler'
import { Log, LoginScreen } from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import Initial from './screens/Init';


export default function App() {

const [fontsLoaded] = useFonts({
'Marker': require('./fonts/PermanentMarker-Regular.ttf'),
});


  return (
    <NavigationContainer>
      <MainNavigator />
    </NavigationContainer>
  );
}


/*
export default function App() {
  const [showLogin, setShowLogin] = useState(false); 

  const [fontsLoaded] = useFonts({
'Marker': require('./fonts/PermanentMarker-Regular.ttf'),
});

  const handlePress = () => {
    alert("¡Bienvenido a Cine-Top!");
  };

  const loginPress = () => {
    setShowLogin(true);
  };


  if (showLogin) {
    return <Init />;
  }

  return (
    <View style={styles.container}>
      <Image source={require('./assets/logoinicio.jpg')} style={styles.logo} />
      <Text style={styles.welcomeText}>Bienvenido a Cine-Top</Text>
      <Text style={styles.subtitle}>Gestiona tus tareas con la mayor facilidad</Text>

      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={loginPress}>
        <Text style={styles.buttonText}>Prueba</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#ff6347',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
});
*/