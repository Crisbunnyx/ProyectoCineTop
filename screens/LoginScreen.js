import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, Platform, Alert } from 'react-native';
import { useState } from 'react';
import { useFonts } from 'expo-font';
import InitScreen from '../screens/Init';
import { PointerType } from 'react-native-gesture-handler';
import Initial from '../screens/Init';
import appFirebase from '../credentials'
import {getAuth, signInWithEmailAndPassword} from 'firebase/auth'
import { useNavigation } from '@react-navigation/native';

const auth = getAuth(appFirebase)

export default function LoginScreen(props) {

  const [email, setEmail] = useState()
  const [password, setPassword] = useState()

  const navigation = useNavigation();

  const logueo = async()=>{
    try {
      await signInWithEmailAndPassword(auth, email, password)
      Alert.alert('Iniciando Sesion', 'Accediendo...')
      navigation.navigate('Home')

    } catch (error) {
        console.log(error);
      }

  }



  const [showLogin, setShowLogin] = useState(false); 

  const loginPress = () => {
    setShowLogin(true);
  };

    if (showLogin) {
      return <Initial/>;
    }

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logoinicio.jpg')} style={styles.logo} />  
      <Text style= {styles.tittleText}>Cine-Top</Text>  
      <View style={styles.targets}>

        <View style= {styles.boxText}>
          <TextInput placeholder='correo@gmail.com' style={{paddingHorizontal:15}}
          onChangeText={(text)=>setEmail(text)} />
        </View>

                <View style= {styles.boxText}>
          <TextInput placeholder='Password' style={{paddingHorizontal:15}} secureTextEntry = {true}
          onChangeText={(text)=>setPassword(text)} />
        </View>

        <View style = {styles.containerButton}>
          <TouchableOpacity style={styles.boxButton} onPress={logueo}>
            <Text style={styles.btnText}>Ingresar</Text>
          </TouchableOpacity>
        </View>

      </View>




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
    width: 150,
    height: 150,
    borderRadius: 10,
  },

  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },

  targets: {
    margin: 20,
    backgroundColor: '#f4f6f6',
    borderRadius: 20,
    width: '90%',
    padding: 20,
    shadowColor: 'blue',
    shadowOffset:{
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation:5,
  },

  boxText:{
    paddingVertical: 10,
    backgroundColor: '#cccccc40',
    borderRadius: 50,
    marginVertical: 10,
  },

  containerButton:{
    alignItems: 'center',

  },

  boxButton:{
    backgroundColor: '#525fe1',
    borderRadius: 30,
    paddingVertical: 20,
    width: 150,
    marginTop: 20,

  },

  btnText:{
    textAlign: 'center',
    color: 'white'
  },

  tittleText:{
    color: 'black',
    fontFamily: 'Marker',
    fontSize: 50,
    marginTop: 10,
  }

  
});