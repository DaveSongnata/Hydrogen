import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  {
    name: 'controle_atividades',
    location: 'default',
  },
  () => {},
  error => { console.log(error); }
);

export const createTables = () => {
  db.transaction(txn => {
    txn.executeSql(
      `CREATE TABLE IF NOT EXISTS Usuario (nomeusuario TEXT)`,
      [],
      () => console.log('Tabela Usuario criada com sucesso.'),
      error => console.log('Erro ao criar tabela Usuario.', error)
    );
    txn.executeSql(
      `CREATE TABLE IF NOT EXISTS Atividades (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, metadeagua INTEGER, prioridade INTEGER)`,
      [],
      () => console.log('Tabela Atividades criada com sucesso.'),
      error => console.log('Erro ao criar tabela Atividades.', error)
    );
    txn.executeSql(
      `CREATE TABLE IF NOT EXISTS Acoes (
        rowid INTEGER PRIMARY KEY AUTOINCREMENT, 
        Qtdreal INTEGER, 
        idatividade INTEGER,
        concluida INTEGER DEFAULT 0,
        data_conclusao TEXT
      )`,
      [],
      () => console.log('Tabela Acoes criada com sucesso.'),
      error => console.log('Erro ao criar tabela Acoes.', error)
    );
    txn.executeSql(
      `CREATE TABLE IF NOT EXISTS Agua_disponivel (qtdaguadisponivel INTEGER)`,
      [],
      () => console.log('Tabela Agua_disponivel criada com sucesso.'),
      error => console.log('Erro ao criar tabela Agua_disponivel.', error)
    );
  });
};

export default db;
