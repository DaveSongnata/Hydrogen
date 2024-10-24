import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Text, List } from 'react-native-paper';
import { LineChart } from 'react-native-gifted-charts';
import moment from 'moment';
import db from '../database/db';
import theme from '../styles/theme';

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
      const chartData = dados.map(item => ({
        value: parseFloat(item.value || item.eficiencia) || 0,
        label: item.date || item.data,
        dataPointText: `${(parseFloat(item.value || item.eficiencia) || 0).toFixed(1)}${titulo.includes('Eficiência') ? '%' : ''}`,
      }));

      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{titulo}</Text>
          <LineChart
            data={chartData}
            height={250}
            width={350}
            spacing={40}
            initialSpacing={20}
            color={theme.colors.primary}
            thickness={2}
            startFillColor={`${theme.colors.primary}20`}
            endFillColor={`${theme.colors.primary}00`}
            startOpacity={0.9}
            endOpacity={0.2}
            backgroundColor="#fff"
            rulesColor="#e3e3e3"
            rulesType="solid"
            yAxisColor="#e3e3e3"
            xAxisColor="#e3e3e3"
            xAxisLabelTextStyle={{ color: theme.colors.text, fontSize: 12 }}
            yAxisTextStyle={{ color: theme.colors.text, fontSize: 12 }}
            hideDataPoints={false}
            dataPointsColor={theme.colors.primary}
            dataPointsRadius={5}
            curved
            showVerticalLines
            verticalLinesColor="rgba(14,164,164,0.5)"
            xAxisLabelRotation={-45}
            hideYAxisText={false}
            yAxisLabelPrefix={titulo.includes('Eficiência') ? '' : ''}
            yAxisLabelSuffix={titulo.includes('Eficiência') ? '%' : ''}
            pointerConfig={{
              pointerStripHeight: 160,
              pointerStripColor: theme.colors.primary,
              pointerStripWidth: 2,
              pointerColor: theme.colors.primary,
              radius: 6,
              pointerLabelWidth: 100,
              pointerLabelHeight: 90,
              activatePointersOnLongPress: true,
              autoAdjustPointerLabelPosition: true,
              pointerLabelComponent: (items) => {
                const item = items[0];
                return (
                  <View style={styles.tooltipContainer}>
                    <Text style={styles.tooltipText}>
                      {item.label}
                    </Text>
                    <Text style={styles.tooltipValue}>
                      {item.dataPointText}
                    </Text>
                  </View>
                );
              },
            }}
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
