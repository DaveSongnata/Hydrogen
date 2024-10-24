import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import db from '../database/db';
import theme from '../styles/theme';
import CustomIcon from '../components/common/CustomIcon';

const PrimeiraExecucao = ({ navigation }) => {
  const [nome, setNome] = useState('');
  const [aguaTotal, setAguaTotal] = useState('');

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    const hasLaunched = await AsyncStorage.getItem('@hasLaunched');
    if (hasLaunched) {
      navigation.replace('Home');
    }
  };

  const salvarUsuario = () => {
    if (!nome || !aguaTotal) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    db.transaction(txn => {
      txn.executeSql(
        `INSERT INTO Usuario (nomeusuario) VALUES (?)`,
        [nome],
        (tx, res) => {
          tx.executeSql(
            `INSERT INTO Agua_disponivel (qtdaguadisponivel) VALUES (?)`,
            [parseInt(aguaTotal)],
            async (tx, res) => {
              await AsyncStorage.setItem('@hasLaunched', 'true');
              navigation.replace('Home');
            },
            error => { console.log('Erro ao salvar água disponível', error); }
          );
        },
        error => { console.log('Erro ao salvar o nome do usuário', error); }
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <CustomIcon 
          name="logo" 
          size={150} // Logo bem maior para dar destaque
          style={styles.logo} 
        />
        <Text style={styles.title}>Bem-vindo ao Hydrogen</Text>
        <TextInput
          style={styles.input}
          label="Seu nome"
          value={nome}
          onChangeText={setNome}
          mode="outlined"
        />
        <TextInput
          style={styles.input}
          label="Quantidade total de água (L)"
          value={aguaTotal}
          onChangeText={setAguaTotal}
          keyboardType="numeric"
          mode="outlined"
        />
        <TouchableOpacity style={styles.button} onPress={salvarUsuario}>
          <Text style={styles.buttonText}>Começar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    marginBottom: 40,
    tintColor: null, // Remove a coloração para manter as cores originais
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    marginBottom: 15,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: theme.roundness,
    width: '100%',
    marginTop: 10,
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default PrimeiraExecucao;
