const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conexão MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',     // Seu usuário MySQL
  password: '',     // Sua senha MySQL
  database: 'mindflowdb'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Erro conectando ao MySQL:', err);
    return;
  }
  console.log('✅ Conectado ao MySQL!');
});

// ------------------------------
// Funções de conversão
// ------------------------------

const converterTarefa = (tarefaDB) => ({
  id: `task-${tarefaDB.id}`,
  name: tarefaDB.titulo,
  description: tarefaDB.descricao,
  dueDate: tarefaDB.data_vencimento,
  priority: tarefaDB.prioridade,
  sprintId: tarefaDB.sprint_id ? `sprint-${tarefaDB.sprint_id}` : null,
  status: tarefaDB.status
});

const converterParaMySQL = (tarefaReact) => ({
  titulo: tarefaReact.name,
  descricao: tarefaReact.description,
  prioridade: tarefaReact.priority,
  data_vencimento: tarefaReact.dueDate,
  status: tarefaReact.status,
  sprint_id: tarefaReact.sprintId ? parseInt(tarefaReact.sprintId.replace('sprint-', '')) : null,
  usuario_id: 1
});

// ------------------------------
// ROTAS
// ------------------------------

// GET – Buscar tarefas
app.get('/api/tarefas', (req, res) => {
  const query = 'SELECT * FROM tarefas ORDER BY criado_em DESC';

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Erro buscando tarefas:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    const tarefasConvertidas = results.map(converterTarefa);
    console.log('📦 Tarefas carregadas:', tarefasConvertidas.length);
    res.json(tarefasConvertidas);
  });
});

// POST – Criar tarefa
app.post('/api/tarefas', (req, res) => {
  const tarefaReact = req.body;
  const tarefaMySQL = converterParaMySQL(tarefaReact);

  const query = `
    INSERT INTO tarefas (titulo, descricao, prioridade, data_vencimento, status, sprint_id, usuario_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query,
    [
      tarefaMySQL.titulo,
      tarefaMySQL.descricao,
      tarefaMySQL.prioridade,
      tarefaMySQL.data_vencimento,
      tarefaMySQL.status,
      tarefaMySQL.sprint_id,
      tarefaMySQL.usuario_id
    ],
    (err, results) => {
      if (err) {
        console.error('❌ Erro criando tarefa:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      db.query('SELECT * FROM tarefas WHERE id = ?', [results.insertId], (err, taskResults) => {
        const tarefaCriada = converterTarefa(taskResults[0]);
        console.log('✅ Tarefa criada:', tarefaCriada.name);
        res.json({ tarefa: tarefaCriada });
      });
    }
  );
});

// PUT – Atualizar tarefa
app.put('/api/tarefas/:id', (req, res) => {
  const taskId = req.params.id.replace('task-', '');
  const tarefaReact = req.body;
  const tarefaMySQL = converterParaMySQL(tarefaReact);

  const query = `
    UPDATE tarefas 
    SET titulo=?, descricao=?, prioridade=?, data_vencimento=?, status=?, sprint_id=?
    WHERE id=?
  `;

  db.query(query,
    [
      tarefaMySQL.titulo,
      tarefaMySQL.descricao,
      tarefaMySQL.prioridade,
      tarefaMySQL.data_vencimento,
      tarefaMySQL.status,
      tarefaMySQL.sprint_id,
      taskId
    ],
    (err) => {
      if (err) {
        console.error('❌ Erro atualizando tarefa:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      console.log('♻️ Tarefa atualizada:', tarefaReact.name);
      res.json({ message: 'Tarefa atualizada!' });
    }
  );
});

// DELETE – Excluir tarefa
app.delete('/api/tarefas/:id', (req, res) => {
  const taskId = req.params.id.replace('task-', '');

  db.query('DELETE FROM tarefas WHERE id = ?', [taskId], (err) => {
    if (err) {
      console.error('❌ Erro excluindo tarefa:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    console.log('🗑️ Tarefa excluída ID:', taskId);
    res.json({ message: 'Tarefa excluída!' });
  });
});

// ------------------------------
// SERVIDOR
// ------------------------------

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando: http://localhost:${PORT}`);
});
