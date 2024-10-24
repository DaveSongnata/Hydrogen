import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, List, Text } from 'react-native-paper';
import db from '../database/db';
import theme from '../styles/theme';
import CustomIcon from './common/CustomIcon'; // Corrigido o caminho do import
import CustomAlert from './common/CustomAlert';

const CriarAcao = ({ navigation }) => {
  const [qtdReal, setQtdReal] = useState('');
  const [atividades, setAtividades] = useState([]);
  const [atividadeSelecionada, setAtividadeSelecionada] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: []
  });

  useEffect(() => {
    carregarAtividades();
  }, []);

  const carregarAtividades = () => {
    db.transaction(txn => {
      txn.executeSql(
        `SELECT * FROM Atividades ORDER BY prioridade DESC`,
        [],
        (tx, res) => {
          let temp = [];
          for (let i = 0; i < res.rows.length; ++i) {
            temp.push(res.rows.item(i));
          }
          setAtividades(temp);
        },
        error => { console.log('Erro ao buscar atividades', error); }
      );
    });
  };

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

  const salvarAcao = () => {
    if (!atividadeSelecionada || !qtdReal) {
      showAlert(
        'Erro',
        'Por favor, selecione uma atividade e insira a quantidade real.',
        [{ text: 'OK', style: 'cancel' }]
      );
      return;
    }

    db.transaction(txn => {
      txn.executeSql(
        `INSERT INTO Acoes (Qtdreal, idatividade) VALUES (?, ?)`,
        [parseInt(qtdReal), atividadeSelecionada.id],
        (tx, res) => {
          showAlert(
            'Sucesso',
            'Ação criada com sucesso!',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        },
        error => { 
          console.log('Erro ao salvar ação', error);
          showAlert(
            'Erro',
            'Ocorreu um erro ao salvar a ação.',
            [{ text: 'OK', style: 'cancel' }]
          );
        }
      );
    });
  };

  return (
    <View style={styles.container}>
      <List.Accordion
        title={atividadeSelecionada ? atividadeSelecionada.nome : "Selecione uma atividade"}
        expanded={expanded}
        onPress={() => setExpanded(!expanded)}
        right={props => (
          <CustomIcon 
            name={expanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color={theme.colors.text}
            style={{ 
              marginRight: 8,
              resizeMode: 'contain'
            }}
          />
        )}
      >
        {atividades.map(atividade => (
          <List.Item
            key={atividade.id}
            title={atividade.nome}
            description={`Prioridade: ${atividade.prioridade}, Meta de água: ${atividade.metadeagua} L`}
            onPress={() => {
              setAtividadeSelecionada(atividade);
              setExpanded(false);
            }}
          />
        ))}
      </List.Accordion>
      {atividadeSelecionada && (
        <Text style={styles.metaAgua}>Meta de água: {atividadeSelecionada.metadeagua} L</Text>
      )}
      <TextInput
        style={styles.input}
        label="Quantidade Real (L)"
        value={qtdReal}
        onChangeText={setQtdReal}
        keyboardType="numeric"
        mode="outlined"
      />
      <TouchableOpacity style={styles.button} onPress={salvarAcao}>
        <Text style={styles.buttonText}>Salvar Ação</Text>
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
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  metaAgua: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.primary,
  },
});

export default CriarAcao;
