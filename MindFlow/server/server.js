const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs'); 
const multer = require('multer'); 
const path = require('path');
const http = require('http'); 
const { Server } = require('socket.io'); 

const app = express();
const httpServer = http.createServer(app);
const PORT = 3001; 

// --- Configuração do Socket.io ---
const io = new Server(httpServer, {
    cors: {
        origin: `http://localhost:5173`,
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// --- Configuração do Multer para upload de arquivos ---
const uploadsDir = path.join(__dirname, 'uploads/');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- Middlewares ---
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));
// Garante que o Node.js encontra o __dirname
app.use((req, res, next) => {
    // Para fins de logs e debug, garante que o __dirname existe em CJS
    next();
});

// --- Conexão MySQL ---
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',     
  password: '',     
  database: 'mindflowdb'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Erro conectando ao MySQL:', err.code, err.message);
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
  status: tarefaDB.status,
  usuarioId: tarefaDB.usuario_id
});

const converterParaMySQL = (tarefaReact, usuario_id = 1) => ({
  titulo: tarefaReact.name,
  descricao: tarefaReact.description,
  prioridade: tarefaReact.priority,
  data_vencimento: tarefaReact.dueDate,
  status: tarefaReact.status,
  sprint_id: tarefaReact.sprintId ? parseInt(tarefaReact.sprintId.replace('sprint-', '')) : null,
  usuario_id: usuario_id
});

// ------------------------------
// ROTAS DE AUTENTICAÇÃO
// ------------------------------

// POST /register – CADASTRO
app.post('/register', (req, res) => {
    const { nome, email, senha } = req.body;
    
    db.query('SELECT * FROM usuario WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('❌ Erro na consulta de registro:', err);
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
        if (results.length > 0) {
            return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
        }

        bcrypt.hash(senha, 10, (err, hashedPassword) => {
            if (err) {
                console.error('❌ Erro ao criptografar senha:', err);
                return res.status(500).json({ error: 'Erro ao processar senha.' });
            }

            const query = 'INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)';
            db.query(query, [nome, email, hashedPassword], (err, results) => {
                if (err) {
                    console.error('❌ Erro criando usuário:', err);
                    return res.status(500).json({ error: 'Erro ao registrar no banco de dados.' });
                }
                
                console.log('✅ Novo usuário registrado:', nome);
                res.status(201).json({ message: 'Usuário registrado com sucesso!', userId: results.insertId });
            });
        });
    });
});

// POST /login – LOGIN
app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    db.query('SELECT id, nome, senha, avatar FROM usuario WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('❌ Erro na consulta de login:', err);
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }

        const userDB = results[0];
        
        bcrypt.compare(senha, userDB.senha, (err, isMatch) => {
            if (err) {
                console.error('❌ Erro na comparação de senha:', err);
                return res.status(500).json({ error: 'Erro na autenticação.' });
            }

            if (isMatch) {
                const { senha, ...user } = userDB; 
                console.log('✅ Login bem-sucedido:', user.nome);
                res.status(200).json({ 
                    message: 'Login realizado com sucesso!', 
                    user: user 
                });
            } else {
                res.status(401).json({ error: 'E-mail ou senha incorretos.' });
            }
        });
    });
});

// POST /upload-avatar – ATUALIZAÇÃO DO AVATAR (NOVA ROTA)
app.post('/upload-avatar', upload.single('avatar'), (req, res) => {
    // req.file contém o arquivo após o processamento do Multer
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const { userId } = req.body;
    // O caminho que será salvo no banco de dados
    const filePath = `/uploads/${req.file.filename}`;
    
    // 1. Atualizar o caminho do avatar no banco de dados
    const query = 'UPDATE usuario SET avatar = ? WHERE id = ?';

    db.query(query, [filePath, userId], (err, results) => {
        if (err) {
            console.error('❌ Erro atualizando avatar no banco:', err);
            // Em caso de erro no DB, retorne 500
            return res.status(500).json({ error: 'Erro interno ao salvar o avatar.' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        
        // 2. Retornar a URL completa para que o frontend possa exibir a imagem
        const fullUrl = `http://localhost:${PORT}${filePath}`;

        console.log(`✅ Avatar do usuário ${userId} atualizado: ${filePath}`);
        res.status(200).json({ 
            message: 'Avatar atualizado com sucesso!',
            avatarUrl: fullUrl 
        });
    });
});

// ------------------------------
// ROTAS DE TAREFAS (CRUD)
// ------------------------------

app.get('/api/tarefas/:usuario_id', (req, res) => {
  const usuarioId = req.params.usuario_id;
  const query = 'SELECT * FROM tarefas WHERE usuario_id = ? ORDER BY criado_em DESC'; 

  db.query(query, [usuarioId], (err, results) => {
    if (err) {
      console.error('❌ Erro buscando tarefas:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    const tarefasConvertidas = results.map(converterTarefa);
    console.log('📦 Tarefas carregadas:', tarefasConvertidas.length);
    res.json(tarefasConvertidas);
  });
});

app.post('/api/tarefas', (req, res) => {
  const tarefaReact = req.body;
  const usuario_id = tarefaReact.usuarioId || 1; 
  const tarefaMySQL = converterParaMySQL(tarefaReact, usuario_id);

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
        io.to(`user-${usuario_id}`).emit('task:added', tarefaCriada);
        res.json({ tarefa: tarefaCriada });
      });
    }
  );
});

app.put('/api/tarefas/:id', (req, res) => {
  const taskId = req.params.id.replace('task-', '');
  const tarefaReact = req.body;
  const usuario_id = tarefaReact.usuarioId || 1;
  const tarefaMySQL = converterParaMySQL(tarefaReact, usuario_id);

  const query = `
    UPDATE tarefas 
    SET titulo=?, descricao=?, prioridade=?, data_vencimento=?, status=?, sprint_id=?
    WHERE id=? AND usuario_id=?
  `;

  db.query(query,
    [
      tarefaMySQL.titulo,
      tarefaMySQL.descricao,
      tarefaMySQL.prioridade,
      tarefaMySQL.data_vencimento,
      tarefaMySQL.status,
      tarefaMySQL.sprint_id,
      taskId,
      usuario_id
    ],
    (err) => {
      if (err) {
        console.error('❌ Erro atualizando tarefa:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      console.log('♻️ Tarefa atualizada:', tarefaReact.name);
      io.to(`user-${usuario_id}`).emit('task:updated', { id: `task-${taskId}`, ...tarefaReact });
      res.json({ message: 'Tarefa atualizada!' });
    }
  );
});

app.delete('/api/tarefas/:id', (req, res) => {
  const taskId = req.params.id.replace('task-', '');
  const usuario_id = req.body.usuarioId || 1; 

  db.query('DELETE FROM tarefas WHERE id = ? AND usuario_id = ?', [taskId, usuario_id], (err, results) => {
    if (err) {
      console.error('❌ Erro excluindo tarefa:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Tarefa não encontrada ou não pertence ao usuário.' });
    }
    console.log('🗑️ Tarefa excluída ID:', taskId);
    io.to(`user-${usuario_id}`).emit('task:deleted', { id: `task-${taskId}` });
    res.json({ message: 'Tarefa excluída!' });
  });
});

// ------------------------------
// ROTAS DE CHAT 
// ------------------------------

// GET /api/messages/:userId - Buscar histórico de chat
app.get('/api/messages/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = 'SELECT id, sender_type, content, file_path, sender_name, created_at FROM messages WHERE user_id = ? ORDER BY created_at ASC';

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('❌ Erro ao buscar mensagens:', err);
            return res.status(500).json({ message: 'Erro ao buscar mensagens.' });
        }
        
        const messagesWithFullUrl = results.map(msg => ({
            ...msg,
            file_path: msg.file_path ? `http://localhost:${PORT}${msg.file_path}` : null,
        }));
        
        res.status(200).json(messagesWithFullUrl);
    });
});

// POST /api/messages - Enviar mensagem (incluindo IA ou upload)
app.post('/api/messages', upload.single('file'), (req, res) => {
    const { user_id, sender_type, content, sender_name } = req.body;
    const file_path = req.file ? `/uploads/${req.file.filename}` : null;
    const userId = parseInt(user_id);

    if (!userId || !sender_type || !content) {
        return res.status(400).json({ message: 'Campos obrigatórios ausentes.' });
    }

    const sql = 'INSERT INTO messages (user_id, sender_type, content, file_path, sender_name) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [userId, sender_type, content, file_path, sender_name], (err, result) => {
        if (err) {
            console.error('❌ Erro ao inserir mensagem:', err);
            return res.status(500).json({ message: 'Erro ao enviar mensagem.' });
        }

        const newMessage = {
            id: result.insertId,
            user_id: userId,
            sender_type,
            content,
            file_path: file_path ? `http://localhost:${PORT}${file_path}` : null,
            sender_name,
            created_at: new Date().toISOString(),
        };

        io.to(`chat-${userId}`).emit('message:new', newMessage);

        res.status(201).json({ message: 'Mensagem enviada com sucesso!', message: newMessage });
    });
});


// ------------------------------
// SOCKET.IO (COMUNICAÇÃO EM TEMPO REAL)
// ------------------------------

io.on('connection', (socket) => {
    console.log(`📡 Novo cliente conectado: ${socket.id}`);

    socket.on('user:join', (userId) => {
        const room = `user-${userId}`;
        socket.join(room);
        console.log(`👤 Cliente ${socket.id} entrou na sala ${room} (Tarefas/Geral)`);
    });

    socket.on('chat:join', (userId) => {
        const chatRoom = `chat-${userId}`;
        socket.join(chatRoom);
        console.log(`💬 Cliente ${socket.id} entrou na sala de chat ${chatRoom}`);
    });

    socket.on('disconnect', () => {
        console.log(`🔌 Cliente desconectado: ${socket.id}`);
    });
});

//Sprint
app.post('/sprints', (req, res) => {
    const { name, startDate, endDate, goal, color, usuarioId } = req.body;

    // Validação simples
    if (!usuarioId) {
        return res.status(400).json({ error: 'ID do usuário é obrigatório.' });
    }

    const query = `
        INSERT INTO sprints (name, start_date, end_date, goal, color, usuario_id) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(query, 
        [name, startDate, endDate, goal, color || '#5a52d9', usuarioId], 
        (err, results) => {
            if (err) {
                console.error('❌ Erro criando sprint:', err);
                return res.status(500).json({ error: 'Erro ao salvar sprint no banco.' });
            }

            console.log('✅ Sprint criada com sucesso:', name);
            
            // Retorna a sprint criada com o ID gerado pelo banco (insertId)
            res.status(201).json({ 
                id: results.insertId,
                name, 
                startDate, 
                endDate, 
                goal, 
                color, 
                usuarioId 
            });
        }
    );
});

// GET /sprints/:usuario_id - Carregar as Sprints do Banco ao iniciar
app.get('/sprints/:usuario_id', (req, res) => {
    const usuarioId = req.params.usuario_id;
    
    // Busca todas as sprints daquele usuário
    const query = 'SELECT * FROM sprints WHERE usuario_id = ? ORDER BY start_date DESC';

    db.query(query, [usuarioId], (err, results) => {
        if (err) {
            console.error('❌ Erro buscando sprints:', err);
            return res.status(500).json({ error: 'Erro ao buscar sprints.' });
        }

        // Formata os dados do banco (snake_case) para o frontend (camelCase)
        const sprintsFormatadas = results.map(sprint => ({
            id: `sprint-${sprint.id}`, // Adiciona o prefixo para funcionar com seu Drag&Drop
            name: sprint.name,
            startDate: sprint.start_date, // MySQL usa start_date
            endDate: sprint.end_date,     // MySQL usa end_date
            goal: sprint.goal,
            color: sprint.color,
            usuarioId: sprint.usuario_id
        }));

        res.json(sprintsFormatadas);
    });
});


// ------------------------------
// INICIALIZAÇÃO DO SERVIDOR (DEVE SER O ÚLTIMO PASSO)
// ------------------------------

httpServer.listen(PORT, () => { 
  console.log(`🚀 Servidor rodando: http://localhost:${PORT}`);
});