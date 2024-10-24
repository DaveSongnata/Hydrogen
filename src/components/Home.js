import React, { useState, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert
} from 'react-native';
import { Text, Card, Title, Paragraph, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import db from '../database/db';
import theme from '../styles/theme';
import moment from 'moment';

const Home = ({ navigation }) => {
  const [nome, setNome] = useState('');
  const [aguaDisponivel, setAguaDisponivel] = useState(0);
  const [acoesPendentes, setAcoesPendentes] = useState([]);
  const [acoesConcluidas, setAcoesConcluidas] = useState([]);

  const carregarDados = useCallback(() => {
    db.transaction(txn => {
      // Carregar nome do usuário
      txn.executeSql(
        `SELECT nomeusuario FROM Usuario LIMIT 1`,
        [],
        (tx, res) => {
          if (res.rows.length > 0) {
            setNome(res.rows.item(0).nomeusuario || '');
          }
        },
        error => { console.log('Erro ao buscar nome do usuário', error); }
      );

      // Carregar água disponível
      txn.executeSql(
        `SELECT qtdaguadisponivel FROM Agua_disponivel LIMIT 1`,
        [],
        (tx, res) => {
          if (res.rows.length > 0) {
            setAguaDisponivel(res.rows.item(0).qtdaguadisponivel || 0);
          }
        },
        error => { console.log('Erro ao buscar água disponível', error); }
      );

      // Carregar ações
      txn.executeSql(
        `SELECT Acoes.rowid, Acoes.Qtdreal, Acoes.concluida, Acoes.data_conclusao, Atividades.nome, Atividades.prioridade, Atividades.metadeagua
         FROM Acoes 
         INNER JOIN Atividades ON Acoes.idatividade = Atividades.id
         ORDER BY Atividades.prioridade DESC, Acoes.concluida ASC`,
        [],
        (tx, res) => {
          let pendentes = [];
          let concluidas = [];
          for (let i = 0; i < res.rows.length; ++i) {
            const item = res.rows.item(i);
            const acao = {
              ...item,
              nome: item.nome || '',
              Qtdreal: item.Qtdreal || 0,
              prioridade: item.prioridade || 0,
              metadeagua: item.metadeagua || 0,
              concluida: !!item.concluida,
            };
            if (acao.concluida) {
              concluidas.push(acao);
            } else {
              pendentes.push(acao);
            }
          }
          setAcoesPendentes(pendentes);
          setAcoesConcluidas(concluidas);
        },
        error => { console.log('Erro ao buscar ações', error); }
      );
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados])
  );

  const marcarComoConcluida = (id, qtdReal) => {
    db.transaction(txn => {
      txn.executeSql(
        `SELECT qtdaguadisponivel FROM Agua_disponivel LIMIT 1`,
        [],
        (tx, res) => {
          const aguaDisponivel = res.rows.item(0).qtdaguadisponivel;
          if (qtdReal > aguaDisponivel) {
            Alert.alert(
              'Atenção',
              'Esta ação pode deixar o estoque de água negativado. Deseja reabastecer a água antes de concluir?',
              [
                {
                  text: 'Reabastecer',
                  onPress: () => navigation.navigate('ReabastecerAgua')
                },
                {
                  text: 'Concluir mesmo assim',
                  onPress: () => concluirAcao(id, qtdReal)
                },
                {
                  text: 'Cancelar',
                  style: 'cancel'
                }
              ]
            );
          } else {
            concluirAcao(id, qtdReal);
          }
        },
        error => { console.log('Erro ao buscar água disponível', error); }
      );
    });
  };

  const concluirAcao = (id, qtdReal) => {
    const dataAtual = moment().format('YYYY-MM-DD HH:mm:ss');
    db.transaction(txn => {
      txn.executeSql(
        `UPDATE Acoes SET concluida = 1, data_conclusao = ? WHERE rowid = ?`,
        [dataAtual, id],
        (tx, res) => {
          txn.executeSql(
            `UPDATE Agua_disponivel SET qtdaguadisponivel = qtdaguadisponivel - ?`,
            [qtdReal],
            (tx, res) => {
              Alert.alert('Sucesso', 'Ação concluída!');
              carregarDados();
            },
            error => { console.log('Erro ao atualizar água disponível', error); }
          );
        },
        error => { console.log('Erro ao concluir ação', error); }
      );
    });
  };

  const reabastecerAgua = () => {
    navigation.navigate('ReabastecerAgua');
  };

  const renderAcaoItem = ({ item }) => (
    <Card style={[styles.actionItem, item.concluida ? styles.actionItemConcluida : null]}>
      <Card.Content>
        <Title>{item.nome}</Title>
        <Paragraph>Quantidade: {item.Qtdreal} L</Paragraph>
        <Paragraph>Prioridade: {item.prioridade}</Paragraph>
        <Paragraph>Eficiência: {calcularEficiencia(item.Qtdreal, item.metadeagua)}%</Paragraph>
        {item.concluida && (
          <Paragraph>
            Concluída em: {moment(item.data_conclusao).format('DD/MM/YYYY HH:mm')}
          </Paragraph>
        )}
      </Card.Content>
      {!item.concluida && (
        <View style={styles.actionButtonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate('EditarAcao', { acao: item })}
          >
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => marcarComoConcluida(item.rowid, item.Qtdreal)}
          >
            <Text style={styles.actionButtonText}>Concluir</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );

  const calcularEficiencia = (qtdReal, metaAgua) => {
    if (metaAgua === 0 || qtdReal === 0) return 0;
    const eficiencia = (metaAgua / qtdReal) * 100;
    return eficiencia.toFixed(2);
  };

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {nome}!</Text>
        <View style={styles.waterInfoContainer}>
          <MaterialCommunityIcons name="water" size={30} color={theme.colors.surface} />
          <Text style={styles.waterInfo}>{aguaDisponivel} L</Text>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={reabastecerAgua}>
          <Text style={styles.buttonText}>Reabastecer Água</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CriarAtividade')}>
          <Text style={styles.buttonText}>Criar Atividade</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CriarAcao')}>
          <Text style={styles.buttonText}>Criar Ação</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Graficos')}>
          <Text style={styles.buttonText}>Ver Gráficos</Text>
        </TouchableOpacity>
      </View>
      
      <Divider style={styles.divider} />
      
      <Text style={styles.sectionTitle}>Ações Pendentes</Text>
    </>
  );

  const renderFooter = () => (
    <>
      <Divider style={styles.divider} />
      <Text style={styles.sectionTitle}>Ações Concluídas</Text>
    </>
  );

  return (
    <FlatList
      style={styles.container}
      ListHeaderComponent={renderHeader}
      data={acoesPendentes}
      renderItem={renderAcaoItem}
      keyExtractor={(item) => item.rowid.toString()}
      ListFooterComponent={() => (
        <>
          {renderFooter()}
          <FlatList
            data={acoesConcluidas}
            renderItem={renderAcaoItem}
            keyExtractor={(item) => item.rowid.toString()}
            ListEmptyComponent={<Text style={styles.emptyListText}>Nenhuma ação concluída</Text>}
          />
        </>
      )}
      ListEmptyComponent={<Text style={styles.emptyListText}>Nenhuma ação pendente</Text>}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: theme.colors.primary,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.surface,
    marginBottom: 10,
  },
  waterInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waterInfo: {
    fontSize: 18,
    color: theme.colors.surface,
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  button: {
    backgroundColor: theme.colors.accent,
    padding: 10,
    borderRadius: theme.roundness,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  divider: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginLeft: 20,
    marginTop: 10,
  },
  actionItem: {
    marginHorizontal: 20,
    marginVertical: 5,
    elevation: 2,
  },
  actionItemConcluida: {
    opacity: 0.6,
    backgroundColor: theme.colors.disabled,
  },
  actionTitle: {
    fontSize: 16,
  },
  actionInfo: {
    fontSize: 14,
  },
  actionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10, // Adiciona margem horizontal ao container
    marginBottom: 10, // Adiciona margem inferior ao container
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: theme.roundness,
    alignItems: 'center',
    marginTop: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: theme.colors.accent,
    marginRight: 5, // Adiciona margem à direita do botão Editar
  },
  actionButtonText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    color: theme.colors.placeholder,
  },
});

export default Home;
