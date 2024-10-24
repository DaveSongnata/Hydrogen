import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { TextInput, List, Text } from 'react-native-paper';
import db from '../database/db';
import theme from '../styles/theme';

const CriarAcao = ({ navigation }) => {
  const [qtdReal, setQtdReal] = useState('');
  const [atividades, setAtividades] = useState([]);
  const [atividadeSelecionada, setAtividadeSelecionada] = useState(null);
  const [expanded, setExpanded] = useState(false);

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

  const salvarAcao = () => {
    if (!atividadeSelecionada || !qtdReal) {
      Alert.alert('Erro', 'Por favor, selecione uma atividade e insira a quantidade real.');
      return;
    }

    db.transaction(txn => {
      txn.executeSql(
        `INSERT INTO Acoes (Qtdreal, idatividade) VALUES (?, ?)`,
        [parseInt(qtdReal), atividadeSelecionada.id],
        (tx, res) => {
          Alert.alert('Sucesso', 'Ação criada com sucesso!', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        },
        error => { 
          console.log('Erro ao salvar ação', error);
          Alert.alert('Erro', 'Ocorreu um erro ao salvar a ação.');
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
