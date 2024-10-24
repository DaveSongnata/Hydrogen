import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import db from '../database/db';
import theme from '../styles/theme';
import CustomAlert from './common/CustomAlert';

const ReabastecerAgua = ({ navigation }) => {
  const [quantidade, setQuantidade] = useState('');
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

  const reabastecer = () => {
    if (!quantidade || isNaN(parseInt(quantidade))) {
      showAlert(
        'Erro',
        'Por favor, insira uma quantidade válida',
        [{ text: 'OK', style: 'cancel' }]
      );
      return;
    }

    db.transaction(txn => {
      txn.executeSql(
        `UPDATE Agua_disponivel SET qtdaguadisponivel = qtdaguadisponivel + ?`,
        [parseInt(quantidade)],
        (tx, res) => {
          showAlert(
            'Sucesso',
            'Água reabastecida com sucesso!',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        },
        error => { 
          console.log('Erro ao reabastecer água', error);
          showAlert(
            'Erro',
            'Ocorreu um erro ao reabastecer água',
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
        label="Quantidade de água (L)"
        value={quantidade}
        onChangeText={setQuantidade}
        keyboardType="numeric"
        mode="outlined"
      />
      <TouchableOpacity style={styles.button} onPress={reabastecer}>
        <Text style={styles.buttonText}>Reabastecer</Text>
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
    color: theme.colors.surface, // Corrigido para usar a cor correta
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReabastecerAgua;
