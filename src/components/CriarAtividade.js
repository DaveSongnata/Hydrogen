import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import db from '../database/db';
import theme from '../styles/theme';

const CriarAtividade = ({ navigation }) => {
  const [nomeAtividade, setNomeAtividade] = useState('');
  const [metaAgua, setMetaAgua] = useState('');
  const [prioridade, setPrioridade] = useState('');

  const salvarAtividade = () => {
    if (!nomeAtividade || !metaAgua || !prioridade) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    const metaAguaNum = parseInt(metaAgua);
    const prioridadeNum = parseInt(prioridade);

    if (isNaN(metaAguaNum) || isNaN(prioridadeNum)) {
      Alert.alert('Erro', 'Meta de água e prioridade devem ser números');
      return;
    }

    if (prioridadeNum < 1 || prioridadeNum > 5) {
      Alert.alert('Erro', 'A prioridade deve ser um número entre 1 e 5');
      return;
    }

    db.transaction(txn => {
      txn.executeSql(
        `INSERT INTO Atividades (nome, metadeagua, prioridade) VALUES (?, ?, ?)`,
        [nomeAtividade, metaAguaNum, prioridadeNum],
        () => { 
          Alert.alert('Sucesso', 'Atividade salva com sucesso!', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        },
        error => { 
          console.log('Erro ao salvar atividade', error);
          Alert.alert('Erro', 'Ocorreu um erro ao salvar a atividade');
        }
      );
    });
  };

  return (
    <View style={styles.container}>
      <TextInput 
        style={styles.input}
        label="Nome da Atividade"
        value={nomeAtividade} 
        onChangeText={setNomeAtividade}
        mode="outlined"
      />
      <TextInput 
        style={styles.input}
        label="Meta de Água (L)"
        value={metaAgua} 
        onChangeText={setMetaAgua}
        keyboardType="numeric"
        mode="outlined"
      />
      <TextInput 
        style={styles.input}
        label="Prioridade (1-5)"
        value={prioridade} 
        onChangeText={setPrioridade}
        keyboardType="numeric"
        mode="outlined"
      />
      <TouchableOpacity style={styles.button} onPress={salvarAtividade}>
        <Text style={styles.buttonText}>Salvar Atividade</Text>
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

export default CriarAtividade;
