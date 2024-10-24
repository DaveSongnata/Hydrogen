import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Text, List } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import moment from 'moment';
import db from '../database/db';
import theme from '../styles/theme';
import CustomIcon from './common/CustomIcon';

const Graficos = ({ navigation }) => {
  const [dadosAcoesPorPeriodo, setDadosAcoesPorPeriodo] = useState([]);
  const [atividades, setAtividades] = useState([]);
  const [atividadeSelecionada, setAtividadeSelecionada] = useState(null);
  const [dadosEficiencia, setDadosEficiencia] = useState([]);
  const [expandedAtividades, setExpandedAtividades] = useState(false);

  useEffect(() => {
    carregarDados();
    carregarAtividades();
  }, []);

  useEffect(() => {
    if (atividadeSelecionada) {
      carregarDadosEficiencia(atividadeSelecionada.id);
    }
  }, [atividadeSelecionada]);

  const carregarDados = () => {
    db.transaction(txn => {
      txn.executeSql(
        `SELECT date(data_conclusao) as data, COUNT(*) as total FROM Acoes WHERE concluida = 1 GROUP BY date(data_conclusao) ORDER BY data_conclusao DESC LIMIT 7`,
        [],
        (tx, res) => {
          const dados = [];
          for (let i = 0; i < res.rows.length; i++) {
            const item = res.rows.item(i);
            dados.unshift({ value: item.total, date: moment(item.data).format('DD/MM') });
          }
          setDadosAcoesPorPeriodo(dados);
        },
        error => { console.log('Erro ao buscar dados de ações por período', error); }
      );
    });
  };

  const carregarAtividades = () => {
    db.transaction(txn => {
      txn.executeSql(
        `SELECT * FROM Atividades`,
        [],
        (tx, res) => {
          const atividadesTemp = [];
          for (let i = 0; i < res.rows.length; i++) {
            atividadesTemp.push(res.rows.item(i));
          }
          setAtividades(atividadesTemp);
        },
        error => { console.log('Erro ao buscar atividades', error); }
      );
    });
  };

  const carregarDadosEficiencia = (idAtividade) => {
    db.transaction(txn => {
      txn.executeSql(
        `SELECT Acoes.Qtdreal, Atividades.metadeagua, Acoes.data_conclusao 
         FROM Acoes 
         INNER JOIN Atividades ON Acoes.idatividade = Atividades.id 
         WHERE Acoes.concluida = 1 AND Acoes.idatividade = ? 
         ORDER BY Acoes.data_conclusao DESC 
         LIMIT 10`,
        [idAtividade],
        (tx, res) => {
          const dados = [];
          for (let i = 0; i < res.rows.length; i++) {
            const item = res.rows.item(i);
            const eficiencia = (item.metadeagua / item.Qtdreal) * 100;
            dados.unshift({
              eficiencia: eficiencia.toFixed(2),
              data: moment(item.data_conclusao).format('DD/MM')
            });
          }
          setDadosEficiencia(dados);
        },
        error => { console.log('Erro ao buscar dados de eficiência', error); }
      );
    });
  };

  const renderLineChart = (dados, titulo) => {
    if (!dados || dados.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text>Nenhum dado disponível para o gráfico</Text>
        </View>
      );
    }

    try {
      const data = {
        labels: dados.map(item => item.date || item.data),
        datasets: [{
          data: dados.map(item => 
            titulo.includes('Eficiência') 
              ? parseFloat(item.eficiencia) 
              : Math.round(parseFloat(item.value))
          )
        }]
      };

      const chartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: titulo.includes('Eficiência') ? 1 : 0,
        color: (opacity = 1) => `rgba(0, 150, 136, ${opacity})`,
        style: {
          borderRadius: 16
        },
        propsForDots: {
          r: "6",
          strokeWidth: "2",
          stroke: theme.colors.primary
        }
      };

      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{titulo}</Text>
          <LineChart
            data={data}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
            yAxisLabel={titulo.includes('Eficiência') ? "" : ""}
            yAxisSuffix={titulo.includes('Eficiência') ? "%" : ""}
            formatYLabel={(value) => 
              titulo.includes('Eficiência') 
                ? `${parseFloat(value).toFixed(1)}` 
                : `${Math.round(value)}`
            }
            fromZero
            segments={titulo.includes('Eficiência') ? 5 : 4}
          />
        </View>
      );
    } catch (error) {
      console.error('Erro ao renderizar gráfico:', error);
      return (
        <View style={styles.errorContainer}>
          <Text>Erro ao carregar o gráfico</Text>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      );
    }
  };

  const renderEficienciaAtividade = () => {
    if (!atividadeSelecionada) {
      return (
        <View style={styles.emptyContainer}>
          <Text>Selecione uma atividade para ver o gráfico de eficiência</Text>
        </View>
      );
    }

    return renderLineChart(dadosEficiencia, `Eficiência das Ações (${atividadeSelecionada.nome})`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {renderLineChart(dadosAcoesPorPeriodo, 'Ações Concluídas por Período')}
        
        <Text style={styles.title}>Eficiência por Atividade</Text>
        <List.Accordion
          title={atividadeSelecionada ? atividadeSelecionada.nome : "Selecione uma atividade"}
          expanded={expandedAtividades}
          onPress={() => setExpandedAtividades(!expandedAtividades)}
          right={props => (
            <CustomIcon 
              name={expandedAtividades ? "chevron-up" : "chevron-down"} 
              size={24} 
              color={theme.colors.text}
              style={{ marginRight: 8 }}
            />
          )}
        >
          {atividades.map(atividade => (
            <List.Item
              key={atividade.id}
              title={atividade.nome}
              onPress={() => {
                setAtividadeSelecionada(atividade);
                setExpandedAtividades(false);
              }}
            />
          ))}
        </List.Accordion>
        
        {renderEficienciaAtividade()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 20,
  },
  chartContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    elevation: 2,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ffebee',
    borderRadius: 10,
    marginVertical: 10,
  },
  errorText: {
    color: '#d32f2f',
    marginTop: 5,
  },
  link: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
    marginTop: 10,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 5,
  },
  label: {
    fontSize: 10,
    color: theme.colors.text,
    transform: [{ rotate: '-45deg' }],
  },
  tooltipContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    elevation: 3,
  },
  tooltipText: {
    color: theme.colors.text,
    fontSize: 12,
    marginBottom: 5,
  },
  tooltipValue: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default Graficos;
