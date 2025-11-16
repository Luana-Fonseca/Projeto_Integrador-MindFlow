import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connection from "./config/db.js";
import bcrypt from "bcryptjs"; 

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(bodyParser.json());

// CADASTRO COM SENHA CRIPTOGRAFADA
app.post("/register", async (req, res) => {
  const { nome, email, senha } = req.body;
  
  try {
    // Criptografa a senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    
    const query = "INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)";
    
    connection.query(query, [nome, email, senhaCriptografada], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao cadastrar usuário", details: err });
      }
      res.json({ message: "Usuário cadastrado com sucesso!" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criptografar senha" });
  }
});

// LOGIN COM COMPARAÇÃO DE SENHA CRIPTOGRAFADA
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  const query = "SELECT * FROM usuario WHERE email = ?";

  connection.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Erro ao fazer login" });
    
    if (results.length > 0) {
      const usuario = results[0];
      
      // Compara a senha digitada com a senha criptografada
      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
      
      if (senhaCorreta) {
        res.json({ 
          message: "Login realizado com sucesso!", 
          user: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
          }
        });
      } else {
        res.status(401).json({ error: "Email ou senha inválidos" });
      }
    } else {
      res.status(401).json({ error: "Email ou senha inválidos" });
    }
  });
});

//  ATUALIZAR AVATAR DO USUÁRIO
app.put("/update-avatar", async (req, res) => {
  const { id, avatar } = req.body;
  
  try {
    const query = "UPDATE usuario SET avatar = ? WHERE id = ?";
    
    connection.query(query, [avatar, id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao atualizar avatar", details: err });
      }
      
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      res.json({ 
        message: "Avatar atualizado com sucesso!",
        avatar: avatar
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar avatar" });
  }
});

//  BUSCAR DADOS DO USUÁRIO (incluindo avatar)
app.get("/user/:id", (req, res) => {
  const userId = req.params.id;
  const query = "SELECT id, nome, email, avatar FROM usuario WHERE id = ?";
  
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao buscar usuário" });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    
    const user = results[0];
    res.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      avatar: user.avatar || '/src/assets/Generic_avatar.png'
    });
  });
});
//  ROTAS DE TAREFAS (ADICIONE ESTE BLOCO COMPLETO)

// Converter formato MySQL para React
const converterTarefa = (tarefaDB) => ({
  id: `task-${tarefaDB.id}`,
  name: tarefaDB.titulo,
  description: tarefaDB.descricao,
  dueDate: tarefaDB.data_vencimento,
  priority: tarefaDB.prioridade,
  sprintId: tarefaDB.sprint_id ? `sprint-${tarefaDB.sprint_id}` : null,
  status: tarefaDB.status
});

// Converter formato React para MySQL
const converterParaMySQL = (tarefaReact) => ({
  titulo: tarefaReact.name,
  descricao: tarefaReact.description,
  prioridade: tarefaReact.priority,
  data_vencimento: tarefaReact.dueDate,
  status: tarefaReact.status,
  sprint_id: tarefaReact.sprintId ? parseInt(tarefaReact.sprintId.replace('sprint-', '')) : null,
  usuario_id: 1
});

//  GET - Buscar todas as tarefas
app.get('/api/tarefas', (req, res) => {
  const query = 'SELECT * FROM tarefas ORDER BY criado_em DESC';
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('❌ Erro buscando tarefas:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    
    const tarefasConvertidas = results.map(converterTarefa);
    console.log('📦 Tarefas do banco:', tarefasConvertidas.length);
    res.json(tarefasConvertidas);
  });
});

//  POST - Criar tarefa
app.post('/api/tarefas', (req, res) => {
  const tarefaReact = req.body;
  const tarefaMySQL = converterParaMySQL(tarefaReact);
  
  const query = `
    INSERT INTO tarefas (titulo, descricao, prioridade, data_vencimento, status, sprint_id, usuario_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  connection.query(query, 
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
      
      connection.query('SELECT * FROM tarefas WHERE id = ?', [results.insertId], (err, taskResults) => {
        const tarefaCriada = converterTarefa(taskResults[0]);
        console.log('✅ Tarefa criada:', tarefaCriada.name);
        res.json({ tarefa: tarefaCriada });
      });
    }
  );
});

//  PUT - Atualizar tarefa
app.put('/api/tarefas/:id', (req, res) => {
  const taskId = req.params.id.replace('task-', '');
  const tarefaReact = req.body;
  const tarefaMySQL = converterParaMySQL(tarefaReact);
  
  const query = `
    UPDATE tarefas 
    SET titulo=?, descricao=?, prioridade=?, data_vencimento=?, status=?, sprint_id=?
    WHERE id=?
  `;
  
  connection.query(query, 
    [
      tarefaMySQL.titulo,
      tarefaMySQL.descricao, 
      tarefaMySQL.prioridade,
      tarefaMySQL.data_vencimento,
      tarefaMySQL.status,
      tarefaMySQL.sprint_id,
      taskId
    ], 
    (err, results) => {
      if (err) {
        console.error('❌ Erro atualizando tarefa:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      console.log('✅ Tarefa atualizada:', tarefaReact.name);
      res.json({ message: 'Tarefa atualizada!' });
    }
  );
});

//  DELETE - Excluir tarefa
app.delete('/api/tarefas/:id', (req, res) => {
  const taskId = req.params.id.replace('task-', '');
  
  connection.query('DELETE FROM tarefas WHERE id = ?', [taskId], (err, results) => {
    if (err) {
      console.error('❌ Erro excluindo tarefa:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    console.log('🗑️ Tarefa excluída ID:', taskId);
    res.json({ message: 'Tarefa excluída!' });
  });
});

//  FIM DAS ROTAS DE TAREFAS

const PORT = 3001;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));''