import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import db from '../database/db';
import theme from '../styles/theme';

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
        <Text style={styles.title}>Bem-vindo ao Hydrogen</Text>
        <MaterialCommunityIcons name="water" size={50} color={theme.colors.primary} />
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
    padding: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: theme.roundness,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PrimeiraExecucao;
