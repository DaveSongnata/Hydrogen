import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import db from '../database/db';
import theme from '../styles/theme';

const ReabastecerAgua = ({ navigation }) => {
  const [quantidade, setQuantidade] = useState('');

  const reabastecer = () => {
    if (!quantidade || isNaN(parseInt(quantidade))) {
      Alert.alert('Erro', 'Por favor, insira uma quantidade válida');
      return;
    }

    db.transaction(txn => {
      txn.executeSql(
        `UPDATE Agua_disponivel SET qtdaguadisponivel = qtdaguadisponivel + ?`,
        [parseInt(quantidade)],
        (tx, res) => {
          Alert.alert('Sucesso', 'Água reabastecida com sucesso!', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        },
        error => { 
          console.log('Erro ao reabastecer água', error);
          Alert.alert('Erro', 'Ocorreu um erro ao reabastecer água');
        }
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reabastecer Água</Text>
      <TextInput
        style={styles.input}
        label="Quantidade de água (L)"
        value={quantidade}
        onChangeText={setQuantidade}
        keyboardType="numeric"
        mode="outlined"
      />
      <TouchableOpacity style={styles.button} onPress={reabastecer}>
        <Text style={styles.buttonText}>Reabastecer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
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
  },
  buttonText: {
    color: theme.colors.background,
  },
});

export default ReabastecerAgua;
