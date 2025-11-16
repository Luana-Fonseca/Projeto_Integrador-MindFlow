const API_URL = 'http://localhost:3001/api';

// Serviço com fallback para localStorage
export const tarefasService = {
  // 🔹 Buscar tarefas (tenta API, depois localStorage)
  getTarefas: async () => {
    // 🔑 NOVO: Lê o ID do usuário logado diretamente aqui
    const userData = JSON.parse(localStorage.getItem('userData'));
    const usuarioId = userData ? userData.id : '1'; // Usa '1' como fallback para depuração, se necessário.

    try {
      console.log(`🔄 Tentando buscar tarefas da API para o usuário: ${usuarioId}...`);
      
      // 🔑 CORREÇÃO: Adiciona o ID do usuário à URL
      const response = await fetch(`${API_URL}/tarefas/${usuarioId}`); 
      
      if (!response.ok) {
        // Se a API não retornar 200 (OK), lança erro para ir para o fallback
        throw new Error('API offline ou ID de usuário inválido.');
      }
      
      const tarefas = await response.json();
      console.log('✅ Tarefas carregadas da API:', tarefas.length);
      
      // 💡 CORREÇÃO DE LOG: Salva o backup no local correto
      localStorage.setItem('tarefas', JSON.stringify(tarefas)); 
      return tarefas;
    } catch (error) {
      console.log('❌ Falha na API. Usando dados locais (não persistentes).', error);
      // 💡 CORREÇÃO DE LOG: Carrega do local correto
      const tarefasLocal = JSON.parse(localStorage.getItem('tarefas') || '[]'); 
      return tarefasLocal;
    }
  },

  // 🔹 Criar tarefa
  createTarefa: async (tarefaData) => {
    try {
      const response = await fetch(`${API_URL}/tarefas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tarefaData)
      });
      
      if (!response.ok) throw new Error('API offline');
      
      const data = await response.json();
      console.log('✅ Tarefa criada na API:', data.tarefa.name);
      return data.tarefa;
    } catch (error) {
      console.log('❌ API offline, criando no localStorage');
      // Fallback para localStorage
      const newTaskId = `task-${Date.now()}`;
      const novaTarefa = { ...tarefaData, id: newTaskId };
      
      const tarefas = JSON.parse(localStorage.getItem('tarefas') || '[]');
      tarefas.push(novaTarefa);
      localStorage.setItem('tarefas', JSON.stringify(tarefas));
      
      return novaTarefa;
    }
  },

  // 🔹 Atualizar tarefa
  updateTarefa: async (taskId, tarefaData) => {
    try {
      const response = await fetch(`${API_URL}/tarefas/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tarefaData)
      });
      
      if (!response.ok) throw new Error('API offline');
      
      console.log('✅ Tarefa atualizada na API:', tarefaData.name);
      return { message: 'Tarefa atualizada!' };
    } catch (error) {
      console.log('❌ API offline, atualizando no localStorage');
      // Fallback para localStorage
      const tarefas = JSON.parse(localStorage.getItem('tarefas') || '[]');
      const index = tarefas.findIndex(t => t.id === taskId);
      
      if (index !== -1) {
        tarefas[index] = { ...tarefas[index], ...tarefaData };
        localStorage.setItem('tarefas', JSON.stringify(tarefas));
      }
      
      return { message: 'Tarefa atualizada localmente!' };
    }
  },

  // 🔹 Excluir tarefa
  deleteTarefa: async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/tarefas/${taskId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('API offline');
      
      console.log('✅ Tarefa excluída da API:', taskId);
      return { message: 'Tarefa excluída!' };
    } catch (error) {
      console.log('❌ API offline, excluindo do localStorage');
      // Fallback para localStorage
      const tarefas = JSON.parse(localStorage.getItem('tarefas') || '[]');
      const novasTarefas = tarefas.filter(t => t.id !== taskId);
      localStorage.setItem('tarefas', JSON.stringify(novasTarefas));
      
      return { message: 'Tarefa excluída localmente!' };
    }
  }
};