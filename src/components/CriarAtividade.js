import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import db from '../database/db';
import theme from '../styles/theme';
import CustomAlert from './common/CustomAlert';

const CriarAtividade = ({ navigation }) => {
  const [nomeAtividade, setNomeAtividade] = useState('');
  const [metaAgua, setMetaAgua] = useState('');
  const [prioridade, setPrioridade] = useState('');
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: []
  });

  const showAlert = (title, message, buttons) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: buttons.map(btn => ({
        ...btn,
        onPress: () => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
          btn.onPress && btn.onPress();
        }
      }))
    });
  };

  const salvarAtividade = () => {
    if (!nomeAtividade || !metaAgua || !prioridade) {
      showAlert(
        'Erro',
        'Por favor, preencha todos os campos',
        [{ text: 'OK', style: 'cancel' }]
      );
      return;
    }

    const metaAguaNum = parseInt(metaAgua);
    const prioridadeNum = parseInt(prioridade);

    if (isNaN(metaAguaNum) || isNaN(prioridadeNum)) {
      showAlert(
        'Erro',
        'Meta de água e prioridade devem ser números',
        [{ text: 'OK', style: 'cancel' }]
      );
      return;
    }

    if (prioridadeNum < 1 || prioridadeNum > 5) {
      showAlert(
        'Erro',
        'A prioridade deve ser um número entre 1 e 5',
        [{ text: 'OK', style: 'cancel' }]
      );
      return;
    }

    db.transaction(txn => {
      txn.executeSql(
        `INSERT INTO Atividades (nome, metadeagua, prioridade) VALUES (?, ?, ?)`,
        [nomeAtividade, metaAguaNum, prioridadeNum],
        () => { 
          showAlert(
            'Sucesso',
            'Atividade salva com sucesso!',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        },
        error => { 
          console.log('Erro ao salvar atividade', error);
          showAlert(
            'Erro',
            'Ocorreu um erro ao salvar a atividade',
            [{ text: 'OK', style: 'cancel' }]
          );
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
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
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
