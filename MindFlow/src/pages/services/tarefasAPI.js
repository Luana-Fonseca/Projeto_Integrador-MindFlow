const API_URL = 'http://localhost:3001/api';

// Serviço com fallback para localStorage
export const tarefasService = {
  // 🔹 Buscar tarefas (tenta API, depois localStorage)
  getTarefas: async () => {
    try {
      console.log('🔄 Tentando buscar tarefas da API...');
      const response = await fetch(`${API_URL}/tarefas`);
      
      if (!response.ok) throw new Error('API offline');
      
      const tarefas = await response.json();
      console.log('✅ Tarefas carregadas da API:', tarefas.length);
      
      // Salva no localStorage como backup
      localStorage.setItem('tarefas-backup', JSON.stringify(tarefas));
      return tarefas;
    } catch (error) {
      console.log('❌ API offline, usando localStorage');
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