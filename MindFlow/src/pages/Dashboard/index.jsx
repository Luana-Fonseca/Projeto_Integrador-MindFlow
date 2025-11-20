import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
// Importações de Componentes
import ChatPanel from '../../components/ChatPanel/ChatPanel.jsx';
import TaskModal from '../../components/TaskModal/index.jsx';
import ColunaTask from '../../components/ColumnTask';
import SprintModal from '../../components/SprintModal';
import StatusChart from '../../components/StatusChart';
import BurndownChart from '../../components/BurndownChart';
import PriorityMatrixChart from '../../components/PriorityMatrixChart';
import genericAvatar from '../../assets/Generic_avatar.png';
// Importação do Drag and Drop
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Importações de Estilos e Assets
import {
    HomeBody,
    LayoutContainer,
    TopBar,
    Logo,
    Avatar,
    Sidebar,
    SidebarLink,
    ContentArea,
    AnimatedBorder,
    SectionTask,
    AddButton,
    TaskListContainer,
    SprintList,
    SprintItem,
    PanelContainer,
    ChartWrapper,
    ChartArea,
    ArrowButton,
    BacklogContainer,
    TaskList,
    TaskHeader,
    TaskRow,
    TaskName,
    TaskPriority,
    ActionButton,
    TaskSprintSelect,
    SettingsPanelContainer,
    SettingsHeader,
    CloseButton,
    ProfileInfo,
    SettingsList,
    SettingsItem,
    FloatingButtonsContainer,
    FloatingButton,
    LogoutLink,
    StyledCalendarContainer,
    ChartGridWrapper,
    MainChartRowWrapper
} from './styles.js';

// 🌟 CORREÇÃO 1: Caminho de importação corrigido para o seu serviço de API
import { tarefasService } from '../services/tarefasAPI';

// Importações para o Calendário
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { addDays } from 'date-fns';

import logoMindFlow from '../../assets/logo_navbar.png';
import IconNotes from '../../assets/nota_2.png';
import IconCalendar from '../../assets/calendario_1.png';
import IconDashboard from '../../assets/painel-do-painel_1.png';
import IconList from '../../assets/lista_1.png';
import IconExit from '../../assets/sair-alt_1.png';

// Configuração do Localizer do Calendário
const locales = {
    'pt-BR': ptBR, // Passa o locale português
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: (date) => startOfWeek(date, { locale: ptBR }), // 0 = Domingo
    getDay,
    locales,
    locale: 'pt-BR',
});

// --- DADOS INICIAIS (Mantidos para o estado inicial) ---

const today = new Date();
const initialSprints = {

};

const initialData = {
    columns: {
        'column-to-do': {
            id: 'column-to-do',
            title: 'A Fazer',
            taskIds: [],
        },
        'column-in-progress': {
            id: 'column-in-progress',
            title: 'Em Andamento',
            taskIds: [],
        },
        'column-done': {
            id: 'column-done',
            title: 'Finalizado',
            taskIds: [],
        },
    },

    columnOrder: ['column-to-do', 'column-in-progress', 'column-done'],
};

// --- CONFIGURAÇÃO DO CARROSSEL DE CHARTS ---
const CHART_COMPONENTS = {
    'Gráfico de Burndown': BurndownChart,
    'Visão Geral de Status': StatusChart,
    'Matriz de Prioridade': PriorityMatrixChart,
};
const CHART_TITLES = Object.keys(CHART_COMPONENTS);

// --- FUNÇÃO DE CONTRASTE (necessária para o calendário) ---
const getContrastTextColor = (hexcolor) => {
    const hex = hexcolor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
    return luminance > 186 ? 'black' : 'white';
};

// --- COMPONENTES DE SEÇÃO ---
const ComponentIA = () => <div><h2>Conteúdo: Inteligência Artificial</h2></div>;

// Variável para a função toggleChat para que ComponentChat possa usá-la.
// Será definida dentro do Dashboard.
let toggleChat = () => console.log('Chat toggle not initialized');

const ComponentChat = () => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        flexDirection: 'column',
        gap: '20px'
    }}>
        <h2>Chat</h2>
        <p>Use o botão flutuante no canto inferior direito para abrir o chat</p>
        <button
            onClick={toggleChat}
            style={{
                padding: '10px 20px',
                backgroundColor: '#5a52d9',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
            }}
        >
            Abrir Chat
        </button>
    </div>
);

// --- COMPONENTE DASHBOARD PRINCIPAL ---
function Dashboard({ navigateTo }) {
    // ESTADOS
    const [activeSprintFilter, setActiveSprintFilter] = useState('all');
    const [kanbanData, setKanbanData] = useState(initialData);
    const [sprints, setSprints] = useState(initialSprints);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('tasks');
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [sprintToEdit, setSprintToEdit] = useState(null);
    const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(genericAvatar);
    const [userName, setUserName] = useState("");
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const taskToEdit = editingTaskId ? kanbanData.tasks[editingTaskId] : null;

    // Lógica de ativação de Sprint
    const [currentActiveSprintId, setCurrentActiveSprintId] = useState(null);
    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();

        let activeId = null;
        Object.values(sprints).forEach(sprint => {
            const startDate = new Date(sprint.startDate + 'T12:00:00');
            const endDate = new Date(sprint.endDate + 'T12:00:00');

            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);

            const startTimestamp = startDate.getTime();
            const endTimestamp = endDate.getTime();

            if (todayTimestamp >= startTimestamp && todayTimestamp <= endTimestamp) {
                activeId = sprint.id;
            }
        });
        setCurrentActiveSprintId(activeId);
    }, [sprints]);

    // FUNÇÕES DE CARREGAMENTO
    const API_BASE_URL = 'http://localhost:3001';

    const loadUserAvatar = () => {
        const userData = localStorage.getItem('userData');
        let avatarPath = localStorage.getItem('userAvatar');

        if (userData) {
            const user = JSON.parse(userData);
            setUserName(user.nome);

            // Se o avatar não foi salvo separadamente, use o caminho do objeto usuário
            if (!avatarPath && user.avatar) {
                avatarPath = user.avatar;
            }
        }

        // 🔑 CORREÇÃO CRÍTICA: Se o caminho for relativo (começa com /uploads), constrói a URL completa
        if (avatarPath && avatarPath.startsWith('/uploads')) {
            const fullUrl = `${API_BASE_URL}${avatarPath}`;
            setAvatarUrl(fullUrl);
            console.log('✅ Avatar carregado (Absoluto):', fullUrl);
        } else if (avatarPath) {
            // Se já for uma URL completa (ex: de um upload anterior que funcionou), usa-a
            setAvatarUrl(avatarPath);
        } else {
            // Se não houver nada, usa o genérico
            setAvatarUrl(genericAvatar);
            console.log('✅ Usando avatar genérico');
        }
    };

    const carregarTarefasDoBanco = async () => {
        try {
            console.log('🔄 Tentando carregar tarefas do banco...');

            // 💡 NOTA: Se o seu GET /api/tarefas/:usuario_id ainda não estiver usando
            // o ID, ele falhará na busca e retornará vazio, causando o problema.
            // Para testar, garanta que há dados vinculados ao ID 1 no BD (se não houver autenticação completa)
            const tarefasAPI = await tarefasService.getTarefas();

            // Converter para seu formato interno do Kanban
            const tasksObject = {};
            const columnTaskIds = {
                'column-to-do': [],
                'column-in-progress': [],
                'column-done': []
            };

            tarefasAPI.forEach(task => {
                tasksObject[task.id] = task;
                const statusMap = {
                    'to-do': 'column-to-do',
                    'in-progress': 'column-in-progress',
                    'done': 'column-done'
                };
                columnTaskIds[statusMap[task.status] || 'column-to-do'].push(task.id);
            });

            setKanbanData(prevData => ({
                ...prevData,
                tasks: tasksObject,
                columns: {
                    ...prevData.columns,
                    'column-to-do': { ...prevData.columns['column-to-do'], taskIds: columnTaskIds['column-to-do'] },
                    'column-in-progress': { ...prevData.columns['column-in-progress'], taskIds: columnTaskIds['column-in-progress'] },
                    'column-done': { ...prevData.columns['column-done'], taskIds: columnTaskIds['column-done'] }
                }
            }));

            console.log('✅ Kanban atualizado com', tarefasAPI.length, 'tarefas');

        } catch (error) {
            console.error('❌ Erro carregando tarefas:', error);
        }
    };

    const carregarSprintsDoBanco = async () => {
        try {
            console.log('🔄 Carregando sprints do banco...');
            const userData = JSON.parse(localStorage.getItem('userData'));
            const usuarioId = userData ? userData.id : null;

            if (!usuarioId) return;

            const response = await fetch(`${API_BASE_URL}/sprints/${usuarioId}`);
            if (response.ok) {
                const sprintsAPI = await response.json();

                // Converte array para objeto (formato que seu estado usa)
                const sprintsObject = {};
                sprintsAPI.forEach(sprint => {
                    sprintsObject[sprint.id] = sprint;
                });

                setSprints(sprintsObject);
                console.log('✅ Sprints carregadas:', sprintsAPI.length);
            }
        } catch (error) {
            console.error('❌ Erro carregando sprints:', error);
        }
    };

    useEffect(() => {
        loadUserAvatar();
        carregarTarefasDoBanco();
        carregarSprintsDoBanco();
    }, []);

    // FUNÇÕES DE CONTROLE
    toggleChat = () => { // Atribui a função à variável global/pai
        setIsChatOpen(prev => !prev);
    };

    const toggleSettingsPanel = () => {
        setIsSettingsPanelOpen(prev => !prev);
    };

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    const openModal = (taskId = null) => {
        setEditingTaskId(taskId);
        setIsModalOpen(true);
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTaskId(null);
    }

    const handleNavClick = (section) => {
        if (section === 'exit') {
            handleLogout();
        } else {
            setActiveSection(section);
        }
    };

    // FUNÇÕES DE SPRINTS
    const handleOpenSprintModal = (sprint = null) => {
        setSprintToEdit(sprint);
        setIsSprintModalOpen(true);
    };

    const handleCloseSprintModal = () => {
        setIsSprintModalOpen(false);
        setSprintToEdit(null);
    };

    const handleSaveSprint = async (sprintData) => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const usuarioId = userData ? userData.id : null;

        if (!usuarioId) {
            alert('Erro: Usuário não logado.');
            return;
        }

        // Validação básica de datas
        const start = new Date(sprintData.startDate);
        const end = new Date(sprintData.endDate);
        if (end < start) {
            alert("A data de término não pode ser anterior à de início.");
            return;
        }

        const dataToSave = {
            ...sprintData,
            usuarioId: usuarioId,
            color: sprintData.color || '#5a52d9'
        };

        try {
            // Envia para o Backend
            const response = await fetch(`${API_BASE_URL}/sprints`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSave)
            });

            if (response.ok) {
                const savedSprint = await response.json();

                // Atualiza a tela com o ID real do banco
                setSprints(prev => ({
                    ...prev,
                    [savedSprint.id]: { ...dataToSave, id: savedSprint.id } // Usa o ID do banco!
                }));

                handleCloseSprintModal();
                console.log('✅ Sprint salva com sucesso!');
            } else {
                alert('Erro ao salvar sprint no servidor.');
            }
        } catch (error) {
            console.error('❌ Erro de conexão:', error);
            alert('Erro de conexão ao salvar sprint.');
        }
    };

    
    // 💡 INÍCIO DA CORREÇÃO E REORGANIZAÇÃO DE FUNÇÕES DE TAREFAS
    // Garante que handleAddTask, handleEditTask, e handleDeleteTask estejam no escopo principal.

    // FUNÇÕES DE TAREFAS (COM API CALLS)
    const handleAddTask = async (newTaskData) => {
        try {
            console.log('🔄 Criando nova tarefa...');

            // 🔑 1. OBTÉM O ID DO USUÁRIO LOGADO DO localStorage
            const userData = JSON.parse(localStorage.getItem('userData'));
            const usuarioId = userData ? userData.id : null;

            if (!usuarioId) {
                alert('Erro: Usuário não logado. Por favor, faça login novamente.');
                return;
            }

            // 🔑 2. INJETA O ID DO USUÁRIO E STATUS NOS DADOS ENVIADOS
            const taskComStatus = {
                ...newTaskData,
                status: 'to-do',
                usuarioId: usuarioId // Adiciona o ID do usuário para o backend
            };

            const novaTarefa = await tarefasService.createTarefa(taskComStatus);

            // Atualização do estado local
            setKanbanData(prevData => {
                const newTasks = { ...prevData.tasks, [novaTarefa.id]: novaTarefa };
                const toDoColumn = prevData.columns['column-to-do'];
                const newToDoTaskIds = [...toDoColumn.taskIds, novaTarefa.id];
                const newToDoColumn = { ...toDoColumn, taskIds: newToDoTaskIds };
                return { ...prevData, tasks: newTasks, columns: { ...prevData.columns, 'column-to-do': newToDoColumn } };
            });

            closeModal();
            console.log('✅ Tarefa criada com sucesso:', novaTarefa.name);
        } catch (error) {
            console.error('❌ Erro criando tarefa:', error);
            alert('Erro ao criar tarefa. Tente novamente.');
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await tarefasService.deleteTarefa(taskId);

            // Atualização do estado local
            setKanbanData(prevData => {
                const newTasks = { ...prevData.tasks };
                delete newTasks[taskId];
                const newColumns = { ...prevData.columns };
                Object.keys(newColumns).forEach(columnId => {
                    newColumns[columnId].taskIds = newColumns[columnId].taskIds.filter(id => id !== taskId);
                });
                return { ...prevData, tasks: newTasks, columns: newColumns };
            });

            closeModal();
        } catch (error) {
            console.error('❌ Erro excluindo tarefa:', error);
            alert('Erro ao excluir tarefa. Tente novamente.');
        }
    };

    const handleEditTask = async (editedTaskData) => {
        try {
            await tarefasService.updateTarefa(editedTaskData.id, editedTaskData);

            // Se o status da tarefa mudou, precisamos mover o ID para a coluna correta
            const oldStatus = kanbanData.tasks[editedTaskData.id]?.status;
            const newStatus = editedTaskData.status;

            setKanbanData(prevData => {
                let newColumns = { ...prevData.columns };
                const newTasks = { ...prevData.tasks, [editedTaskData.id]: editedTaskData };

                if (oldStatus !== newStatus) {
                    const oldColumnId = `column-${oldStatus}`;
                    const newColumnId = `column-${newStatus}`;

                    // 1. Remove da coluna antiga
                    if (newColumns[oldColumnId]) {
                        newColumns[oldColumnId].taskIds = newColumns[oldColumnId].taskIds.filter(id => id !== editedTaskData.id);
                    }
                    // 2. Adiciona à nova coluna (ao final)
                    if (newColumns[newColumnId]) {
                        newColumns[newColumnId].taskIds = [...newColumns[newColumnId].taskIds, editedTaskData.id];
                    }
                }

                return { ...prevData, tasks: newTasks, columns: newColumns };
            });

            closeModal();
        } catch (error) {
            console.error('❌ Erro editando tarefa:', error);
            alert('Erro ao atualizar tarefa. Tente novamente.');
        }
    };

    // 💡 FUNÇÃO CORRIGIDA: Atualiza o estado local E CHAMA A API.
    const handleQuickAssignToSprint = async (taskId, newSprintId) => {
        // 1. Determina o novo valor da sprintId (ID 'sprint-X' ou null)
        const finalSprintId = newSprintId === 'null' ? null : newSprintId;

        // 2. Otimismo: Atualiza o estado local Imediatamente
        setKanbanData(prevData => ({
            ...prevData,
            tasks: {
                ...prevData.tasks,
                [taskId]: {
                    ...prevData.tasks[taskId],
                    sprintId: finalSprintId,
                }
            }
        }));

        // 3. Persistência: Chama a API para salvar a mudança no banco
        try {
            // Pega a tarefa no estado atualizado (após o setKanbanData acima)
            // Nota: Como o setKanbanData é assíncrono, usamos o estado anterior (previsível)
            // e assumimos que o estado foi atualizado para obter o objeto completo.
            // Para garantir que tenhamos a tarefa mais recente, precisamos usar a função
            // de estado para obter o snapshot completo ou reverter o estado em caso de falha.
            
            // Usando a técnica de "closure" para pegar o estado *antes* de chamarmos o serviço
            const taskToUpdate = kanbanData.tasks[taskId];
            
            const updatedTaskData = {
                ...taskToUpdate,
                sprintId: finalSprintId, // <--- O valor que mudou
            };
            
            await tarefasService.updateTarefa(taskId, updatedTaskData);
            
            console.log(`✅ Sprint da tarefa ${taskId} atualizada para: ${finalSprintId}`);

        } catch (error) {
            console.error('❌ Erro ao atualizar sprint da tarefa no banco:', error);

            alert("Atenção: Houve um erro ao salvar a mudança de sprint no banco. Recarregando tarefas...");
            
            // Em caso de falha no API, recarrega TUDO para reverter
            carregarTarefasDoBanco(); 
        }
    };

    const handleDeleteSprint = (sprintId) => {
        setSprints(prevSprints => {
            const { [sprintId]: deletedSprint, ...newSprints } = prevSprints;
            return newSprints;
        });

        setKanbanData(prevData => ({
            ...prevData,
            tasks: Object.values(prevData.tasks).reduce((acc, task) => {
                acc[task.id] = (task.sprintId === sprintId) ? { ...task, sprintId: null } : task;
                return acc;
            }, {}),
        }));

        handleCloseSprintModal();
    };

    // FUNÇÃO DE LOGOUT
    const handleLogout = () => {
        console.log('Usuário deslogando e voltando para a Home...');
        localStorage.removeItem('userData');
        localStorage.removeItem('userAvatar');
        navigateTo('home');
    };

    // LÓGICA DE DRAG AND DROP (COM SALVAGUARDA)
    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        // SALVAGUARDA CONTRA FILTRO
        if (activeSprintFilter !== 'all') {
            alert("A movimentação (D&D) é desativada quando um filtro de sprint está ativo.");
            return;
        }

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const startColumn = kanbanData.columns[source.droppableId];
        const finishColumn = kanbanData.columns[destination.droppableId];

        // 1. Mover DENTRO da mesma coluna
        if (startColumn === finishColumn) {
            const newTaskIds = Array.from(startColumn.taskIds);
            newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, draggableId);

            setKanbanData(prevData => ({
                ...prevData,
                columns: {
                    ...prevData.columns,
                    [startColumn.id]: { ...startColumn, taskIds: newTaskIds },
                },
            }));
            return;
        }

        // 2. Mover ENTRE colunas
        const startTaskIds = Array.from(startColumn.taskIds);
        startTaskIds.splice(source.index, 1);
        const finishTaskIds = Array.from(finishColumn.taskIds);
        finishTaskIds.splice(destination.index, 0, draggableId);

        // Determinar novo status
        const statusMap = {
            'column-to-do': 'to-do',
            'column-in-progress': 'in-progress',
            'column-done': 'done'
        };
        const newStatus = statusMap[finishColumn.id];

        // Atualizar no banco (apenas o status)
        try {
            const taskToUpdate = kanbanData.tasks[draggableId];
            await tarefasService.updateTarefa(draggableId, { ...taskToUpdate, status: newStatus });
        } catch (error) {
            console.error("Erro ao atualizar status da tarefa no banco:", error);
            alert("Atenção: A tarefa foi movida localmente, mas houve um erro ao salvar o novo status no banco.");
        }


        // Atualização do estado local
        setKanbanData(prevData => ({
            ...prevData,
            columns: {
                ...prevData.columns,
                [startColumn.id]: { ...startColumn, taskIds: startTaskIds },
                [finishColumn.id]: { ...finishColumn, taskIds: finishTaskIds },
            },
            tasks: {
                ...prevData.tasks,
                [draggableId]: {
                    ...prevData.tasks[draggableId],
                    status: newStatus
                }
            }
        }));
    };

    const onBacklogDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        // SALVAGUARDA CONTRA BUSCA
        if (searchTerm.trim()) {
            alert("Não é possível reordenar tarefas enquanto a busca estiver ativa.");
            return;
        }

        if (!destination || destination.index === source.index) {
            return;
        }

        const columnToDo = kanbanData.columns['column-to-do'];
        const newTaskIds = Array.from(columnToDo.taskIds);

        newTaskIds.splice(source.index, 1);
        newTaskIds.splice(destination.index, 0, draggableId);

        setKanbanData(prevData => ({
            ...prevData,
            columns: {
                ...prevData.columns,
                'column-to-do': { ...columnToDo, taskIds: newTaskIds },
            },
        }));
    };

    // =========================================================================
    // 💡 COMPONENTES DE CONTEÚDO
    // =========================================================================

    // COMPONENTE: QUADRO KANBAN
    const ComponentTasks = () => {
        const getFilteredTasks = (taskIds) => {
            let tasks = taskIds.map(taskId => kanbanData.tasks[taskId]).filter(Boolean);

            if (activeSprintFilter === 'all') {
                return tasks;
            }

            if (activeSprintFilter === 'backlog') {
                return tasks.filter(task => !task.sprintId);
            }

            return tasks.filter(task => task.sprintId === activeSprintFilter);
        };

        return (
            <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <AddButton onClick={() => openModal(null)}><h2>+</h2></AddButton>

                    {/* Seletor de Filtro de Sprint */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h2 style={{ color: '#3133B8' }}>Selecionar por Sprint:</h2>
                        <TaskSprintSelect
                            value={activeSprintFilter}
                            onChange={(e) => setActiveSprintFilter(e.target.value)}
                        >
                            <option value="all">Todas as Sprints</option>
                            <option value="backlog">Sem Sprint</option>
                            {Object.values(sprints).map(sprint => (
                                <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
                            ))}
                        </TaskSprintSelect>
                    </div>

                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                    <TaskListContainer>
                        {kanbanData.columnOrder.map((columnId) => {
                            const column = kanbanData.columns[columnId];
                            const rawTaskIds = column.taskIds;
                            const tasksToRender = getFilteredTasks(rawTaskIds);

                            return (
                                <ColunaTask
                                    key={column.id}
                                    column={{ ...column, title: `${column.title} (${tasksToRender.length})` }}
                                    onTaskClick={openModal}
                                    tasks={tasksToRender}
                                />
                            );
                        })}
                    </TaskListContainer>
                </DragDropContext>
            </>
        );
    };

    // COMPONENTE: CALENDÁRIO
    const ComponentCalendar = () => {
        const customFormats = {
            dayFormat: 'dd/MM',   // <-- BÔNUS: 'DD/MM' (moment) vira 'dd/MM' (date-fns)
        };
        const [currentDate, setCurrentDate] = useState(new Date());
        const [currentView, setCurrentView] = useState(Views.MONTH);

        // Checa se kanbanData.tasks está vazio (ou não existe)
        const hasTasks = kanbanData.tasks && Object.keys(kanbanData.tasks).length > 0;

        const taskEvents = hasTasks ?
            Object.values(kanbanData.tasks).map(task => {
                const eventDate = new Date(task.dueDate);
                eventDate.setDate(eventDate.getDate() + 1);

                return {
                    id: task.id,
                    title: `[T] ${task.name}`,
                    start: eventDate,
                    end: eventDate,
                    isSprint: false,
                    priority: task.priority,
                };
            })
            : [];

        const sprintEvents = Object.values(sprints).map(sprint => {
            // --- CORREÇÃO INÍCIO ---

            // 1. Garante que tratamos como string e pegamos apenas a parte da DATA (YYYY-MM-DD)
            // Isso resolve tanto "2023-11-18" quanto "2023-11-18T03:00:00.000Z"
            const rawStartDate = String(sprint.startDate).split('T')[0];
            const rawEndDate = String(sprint.endDate).split('T')[0];

            // 2. Agora montamos com o horário fixo de meio-dia para evitar problemas de fuso
            const startDate = new Date(rawStartDate + 'T12:00:00');
            const endDate = new Date(rawEndDate + 'T12:00:00');

            // --- CORREÇÃO FIM ---

            // A biblioteca 'react-big-calendar' exige que a data final seja o dia seguinte
            const adjustedEndDate = addDays(endDate, 1);

            return {
                id: sprint.id,
                title: `[S] ${sprint.name}`,
                start: startDate,
                end: adjustedEndDate,
                isSprint: true,
                color: sprint.color
            };
        });

        const allEvents = [...taskEvents, ...sprintEvents];

        return (
            <StyledCalendarContainer>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid #3133B8', paddingBottom: '10px' }}>

                    <h2>Planejamento de Sprints</h2>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', paddingBottom: '5px' }}>

                        <SprintList style={{
                            position: 'relative',
                            top: 'unset',
                            right: 'unset',
                            flexDirection: 'row',
                            padding: '0 5px'
                        }}>
                            {Object.values(sprints).map(sprint => (
                                <SprintItem
                                    key={sprint.id}
                                    onClick={() => handleOpenSprintModal(sprint)}

                                    style={{
                                        // 1. Define a cor de fundo (com fallback)
                                        backgroundColor: sprint.color || '#F0F0F0',

                                        // 2. APLICA A COR DE TEXTO CALCULADA PARA CONTRASTE
                                        color: getContrastTextColor(sprint.color || '#F0F0F0'),

                                        border: `1px solid ${sprint.color || '#ccc'}`,
                                        padding: '5px 10px',
                                        borderRadius: '5px',
                                        boxShadow: sprint.id === currentActiveSprintId
                                            ? '0 0 10px 2px rgba(90, 82, 217, 0.7)'
                                            : 'none',
                                        fontWeight: sprint.id === currentActiveSprintId
                                            ? 'bold'
                                            : 'normal',
                                    }}
                                >
                                    {sprint.name}
                                </SprintItem>
                            ))}
                        </SprintList>

                        <AddButton
                            onClick={() => handleOpenSprintModal(null)}
                            style={{
                                borderRadius: '8px',
                                padding: '8px 15px',
                                backgroundColor: '#5a52d9',
                                color: 'white',
                                border: 'none'
                            }}
                        >
                            + Nova Sprint
                        </AddButton>
                    </div>
                </div>

                <Calendar
                    culture='pt-BR'
                    localizer={localizer}
                    events={allEvents}
                    formats={customFormats}
                    startAccessor="start"
                    endAccessor="end"
                    date={currentDate}
                    view={currentView}
                    onNavigate={(newDate) => setCurrentDate(newDate)}
                    onView={(newView) => setCurrentView(newView)}
                    messages={{
                        next: "Próximo", previous: "Anterior", today: "Hoje",
                        month: "Mês", week: "Semana", day: "Dia", date: "Data", time: "Hora",
                        events: "Evento",
                    }}
                    eventPropGetter={(event) => {
                        const style = {};

                        // --- 2. CORREÇÃO APLICADA AQUI ---
                        if (event.isSprint) {
                            // Usa a cor do evento ou o default
                            const sprintColor = event.color || '#F0F0F0';

                            // **AQUI ESTÁ A MUDANÇA:** Calcula dinamicamente a cor do texto
                            const textColor = getContrastTextColor(sprintColor);

                            style.backgroundColor = sprintColor;
                            style.border = `1px solid ${sprintColor}`;
                            style.color = textColor; // Define a cor do texto para garantir contraste

                            if (event.id === currentActiveSprintId) {
                                // Se a Sprint estiver ativa, você pode querer forçar o estilo.
                                // Aqui, mantemos o contraste, mas podemos adicionar um destaque visual (ex: borda mais grossa).
                                style.border = `2px solid ${textColor}`;
                                // style.boxShadow = '0 0 5px rgba(0,0,0,0.5)'; // Exemplo de destaque
                            }

                        } else {
                            // Lógica das tarefas (permanece a mesma)
                            const colors = {
                                high: { backgroundColor: '#FFDAD8', color: '#F5222D', borderColor: '#FFA39E' },
                                medium: { backgroundColor: '#FFF7AE', color: '#FAAD14', borderColor: '#FFE58F' },
                                low: { backgroundColor: '#D9F7BE', color: '#52C41A', borderColor: '#B7EB8F' },
                            };
                            // Object.assign(style, colors[event.priority] || {});
                            // É melhor usar Spread Operator para clareza em React
                            Object.assign(style, colors[event.priority] || {});
                        }
                        return { style };
                    }}
                />
            </StyledCalendarContainer>
        );
    };


    // COMPONENTE: PAINEL DE CONTROLE
    const ComponentPanel = () => {
        const mainChartTitle = 'Gráfico de Burndown';
        const secondaryChartTitles = ['Visão Geral de Status', 'Matriz de Prioridade'];
        const MainChartComponent = CHART_COMPONENTS[mainChartTitle];

        const printRef = useRef();

        // 1. Estado para controlar o loading
        const [isGenerating, setIsGenerating] = useState(false);

        const handleGeneratePDF = async () => {
            // Evita clique duplo se já estiver gerando
            if (isGenerating) return;

            console.log("1. Iniciando geração do PDF...");
            setIsGenerating(true); // Ativa o loading

            const element = printRef.current;

            if (!element) {
                console.error("Elemento não encontrado (ref é null)");
                alert("Erro: Não foi possível encontrar a área do gráfico.");
                setIsGenerating(false);
                return;
            }

            try {
                console.log("2. Capturando tela com html2canvas...");

                // Pequeno delay para garantir que renderizações do React terminaram (opcional, mas ajuda com gráficos)
                await new Promise(resolve => setTimeout(resolve, 100));

                const canvas = await html2canvas(element, {
                    scale: 2,
                    backgroundColor: '#ffffff',
                    useCORS: true, // Ajuda se houver imagens externas
                    logging: false, // Desliga logs internos do html2canvas para limpar o console
                    onclone: (clonedDoc) => {
                        // Tenta forçar a renderização correta no clone (útil para alguns libs de gráfico)
                        console.log("DOM clonado com sucesso");
                    }
                });

                console.log("3. Canvas gerado. Criando PDF...");

                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('landscape', 'mm', 'a4');

                const componentWidth = pdf.internal.pageSize.getWidth();
                const componentHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = componentWidth;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

                console.log("4. Salvando arquivo...");
                pdf.save('relatorio-dashboard.pdf');

            } catch (error) {
                console.error("❌ Erro FATAL ao gerar PDF:", error);
                alert("Ocorreu um erro ao gerar o relatório. Verifique o console (F12) para detalhes.");
            } finally {
                // O finally garante que o botão seja liberado mesmo se der erro
                console.log("5. Finalizando processo.");
                setIsGenerating(false);
            }
        };
        return (
            <div>
                {/* --- BOTÃO DE AÇÃO --- */}
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={handleGeneratePDF}
                        style={{
                            padding: '10px 20px',
                            cursor: 'pointer',
                            backgroundColor: '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px'
                        }}
                    >
                        {isGenerating ? (
                            <>
                                <span>⏳</span> Gerando Relatório...
                            </>
                        ) : (
                            <>
                                <span>📄</span> Gerar Relatório PDF
                            </>
                        )}
                    </button>
                </div>

                {/* --- ÁREA DE IMPRESSÃO (Adicionamos a ref aqui) --- */}
                <PanelContainer ref={printRef}>

                    {/* --- 1. GRÁFICO PRINCIPAL (Linha Superior) --- */}
                    <MainChartRowWrapper>
                        <ChartWrapper key={mainChartTitle}>
                            <h3>{mainChartTitle}</h3>
                            <ChartArea>
                                <MainChartComponent
                                    data={kanbanData}
                                    sprints={sprints}
                                />
                            </ChartArea>
                        </ChartWrapper>
                    </MainChartRowWrapper>

                    {/* --- 2. GRÁFICOS SECUNDÁRIOS (Linha Inferior) --- */}
                    <ChartGridWrapper>
                        {secondaryChartTitles.map((title) => {
                            const CurrentChartComponent = CHART_COMPONENTS[title];

                            return (
                                <ChartWrapper key={title}>
                                    <h3>{title}</h3>
                                    <ChartArea>
                                        <CurrentChartComponent
                                            data={kanbanData}
                                            sprints={sprints}
                                        />
                                    </ChartArea>
                                </ChartWrapper>
                            );
                        })}
                    </ChartGridWrapper>
                </PanelContainer>
            </div>
        );
    };


    // COMPONENTE: BACKLOG
    const ComponentList = () => {
        // 1. Lista de todas as tarefas A FAZER (ordem original do backlog)
        const backlogTaskIds = kanbanData.columns['column-to-do'].taskIds;
        let backlogTasks = backlogTaskIds
            .map(taskId => kanbanData.tasks[taskId])
            .filter(task => task && task.id);

        // 🌟 LÓGICA DE FILTRO POR BUSCA (searchTerm)
        const normalizedSearchTerm = searchTerm.toLowerCase().trim();

        if (normalizedSearchTerm) {
            backlogTasks = backlogTasks.filter(task =>
                // Procura no nome da tarefa
                task.name.toLowerCase().includes(normalizedSearchTerm) ||
                // Procura na descrição da tarefa (se existir)
                (task.description && task.description.toLowerCase().includes(normalizedSearchTerm))
            );
        }
        // FIM DA LÓGICA DE FILTRO POR BUSCA

        return (
            <BacklogContainer style={{ border: '2px solid #3133B8', overflow: 'hidden' }}>
                <h2>Backlog do Projeto ({backlogTasks.length} Tarefas encontradas)</h2>

                {/* 🌟 NOVO: Campo de Busca */}
                <input
                    type="text"
                    placeholder="Buscar tarefas por nome ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        marginBottom: '15px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        outline: 'none',
                        fontSize: '16px'
                    }}
                />

                <DragDropContext onDragEnd={onBacklogDragEnd}>
                    <TaskList>
                        <TaskHeader>
                            <div>Ordem</div>
                            <div>Nome da Tarefa</div>
                            <div>Sprint</div>
                            <div>Prioridade</div>
                            <div>Vencimento</div>
                            <div>Ações</div>
                        </TaskHeader>

                        {/* Droppable: Toda a lista é uma zona de soltura */}
                        <Droppable droppableId="backlog-list-area">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {backlogTasks.map((task, index) => (
                                        // Draggable: Cada linha é arrastável
                                        <Draggable key={task.id} draggableId={task.id} index={index}>
                                            {(provided, snapshot) => (
                                                <TaskRow
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    $isDragging={snapshot.isDragging}
                                                >
                                                    <div style={{ fontWeight: 'bold' }}>{index + 1}</div>
                                                    <TaskName>{task.name}</TaskName>

                                                    {/* Select de Sprint - Chamando handleQuickAssignToSprint corrigida */}
                                                    <TaskSprintSelect
                                                        value={task.sprintId || 'null'}
                                                        onChange={(e) => handleQuickAssignToSprint(task.id, e.target.value)}
                                                    >
                                                        <option key="backlog-option" value="null">Global (Backlog)</option>
                                                        {Object.values(sprints).map(sprint => (
                                                            <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
                                                        ))}
                                                    </TaskSprintSelect>

                                                    <TaskPriority priority={task.priority}>{task.priority || 'N/A'}</TaskPriority>
                                                    <div>{task.dueDate}</div>
                                                    <ActionButton onClick={() => openModal(task.id)}>Editar</ActionButton>
                                                </TaskRow>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>

                        {backlogTasks.length === 0 && (
                            <p style={{ marginTop: '20px', color: '#666', textAlign: 'center' }}>
                                Nenhuma tarefa encontrada no Backlog {searchTerm && `com o termo "${searchTerm}"`}.
                            </p>
                        )}
                    </TaskList>
                </DragDropContext>
            </BacklogContainer>
        );
    };

    // MODAL DE UPLOAD DE AVATAR
    const AvatarUploadModal = ({ onClose }) => {
        const userData = JSON.parse(localStorage.getItem('userData'));

        const [selectedFile, setSelectedFile] = useState(null);
        const [previewUrl, setPreviewUrl] = useState(genericAvatar); // Usa genericAvatar como fallback
        const [uploading, setUploading] = useState(false);

        const handleFileSelect = (event) => {
            const file = event.target.files[0];
            if (file) {
                setSelectedFile(file);
                const reader = new FileReader();
                reader.onload = (e) => {
                    setPreviewUrl(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        };

        const handleUpload = async () => {
            if (!selectedFile) {
                alert("Por favor, selecione uma imagem primeiro.");
                return;
            }

            if (!userData || !userData.id) {
                alert("Erro: usuário não identificado.");
                return;
            }

            setUploading(true);

            try {
                const formData = new FormData();
                formData.append('avatar', selectedFile);
                formData.append('userId', userData.id);

                console.log('📤 Enviando upload para usuário:', userData.id);

                const response = await fetch('http://localhost:3001/upload-avatar', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();

                if (response.ok) {
                    const newAvatarUrl = data.avatarUrl;
                    setAvatarUrl(newAvatarUrl); // Atualiza o estado do Dashboard
                    localStorage.setItem('userAvatar', newAvatarUrl);

                    const updatedUserData = { ...userData, avatar: newAvatarUrl };
                    localStorage.setItem('userData', JSON.stringify(updatedUserData));

                    console.log('✅ Avatar atualizado:', newAvatarUrl);
                    alert("✅ Foto alterada com sucesso!");
                    onClose();
                } else {
                    console.error('❌ Erro no upload:', data.error);
                    alert("❌ Erro ao fazer upload: " + data.error);
                }
            } catch (error) {
                console.error('💥 Erro de conexão:', error);
                alert("❌ Erro de conexão ao fazer upload.");
            } finally {
                setUploading(false);
            }
        };

        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '10px',
                    width: '400px',
                    textAlign: 'center'
                }}>
                    <h3>Alterar Foto do Perfil</h3>

                    {/* PREVIEW DA IMAGEM */}
                    <div style={{ margin: '20px 0' }}>
                        <img
                            src={previewUrl}
                            alt="Preview"
                            style={{
                                width: '150px',
                                height: '150px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid #ddd'
                            }}
                        />
                    </div>

                    {/* INPUT DE ARQUIVO */}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{
                            margin: '10px 0',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            width: '100%'
                        }}
                        disabled={uploading}
                    />

                    {/* BOTÕES DE AÇÃO */}
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                        <button
                            onClick={handleUpload}
                            disabled={uploading || !selectedFile}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: (uploading || !selectedFile) ? '#ccc' : '#5a52d9',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: (uploading || !selectedFile) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {uploading ? '📤 Enviando...' : '✅ Confirmar'}
                        </button>
                        <button
                            onClick={onClose}
                            disabled={uploading}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#ccc',
                                color: 'black',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: uploading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            ❌ Cancelar
                        </button>
                    </div>

                    {/* MENSAGEM DE STATUS */}
                    {!selectedFile && (
                        <p style={{ color: '#666', fontSize: '12px', marginTop: '10px' }}>
                            ⚠️ Selecione uma imagem para upload
                        </p>
                    )}
                </div>
            </div>
        );
    };

    // MODAL DE NOTIFICAÇÕES
    const NotificationModal = () => {
        const [notificationSettings, setNotificationSettings] = useState({
            email: true,
            system: true,
            taskReminders: true,
            sprintAlerts: false
        });

        const handleToggle = (setting) => {
            setNotificationSettings(prev => ({
                ...prev,
                [setting]: !prev[setting]
            }));
        };

        const handleSave = () => {
            alert('Configurações de notificação salvas!');
            setIsNotificationModalOpen(false);
        };

        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '25px',
                    borderRadius: '10px',
                    width: '400px',
                    maxWidth: '90vw'
                }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>🔔 Notificações</h3>
                    <div style={{ marginBottom: '20px' }}>
                        {[
                            { key: 'email', label: '📧 Notificações por Email' },
                            { key: 'system', label: '💻 Notificações no Sistema' },
                            { key: 'taskReminders', label: '⏰ Lembretes de Tarefas' },
                            { key: 'sprintAlerts', label: '🚀 Notificações de Sprint' }
                        ].map(item => (
                            <div key={item.key} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 0',
                                borderBottom: '1px solid #eee'
                            }}>
                                <span>{item.label}</span>
                                <input
                                    type="checkbox"
                                    checked={notificationSettings[item.key]}
                                    onChange={() => handleToggle(item.key)}
                                    style={{ transform: 'scale(1.2)' }}
                                />
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                            onClick={handleSave}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#5a52d9',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            Salvar
                        </button>
                        <button
                            onClick={() => setIsNotificationModalOpen(false)}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#ccc',
                                color: '#333',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // PAINEL DE CONFIGURAÇÕES
    const UserSettingsPanel = () => {
        const [userData, setUserData] = useState({ id: 123, nome: "Usuário" });

        useEffect(() => {
            const savedUserData = localStorage.getItem('userData');
            if (savedUserData) {
                setUserData(JSON.parse(savedUserData));
            }
        }, []);

        const settingsItems = [
            { name: "Mudar Foto/Avatar", action: () => setIsAvatarModalOpen(true) },
            {
                name: "Preferências de Notificação",
                action: () => setIsNotificationModalOpen(true)
            },
            {
                name: `Modo Escuro: ${isDarkMode ? 'Ativado' : 'Desativado'}`,
                action: toggleTheme
            },
            { name: "Sair / Logout", action: handleLogout },
        ];

        return (
            <SettingsPanelContainer $isOpen={isSettingsPanelOpen} $isDarkMode={isDarkMode}>
                <SettingsHeader $isDarkMode={isDarkMode}>
                    <h3>Configurações de Usuário</h3>
                    <CloseButton onClick={toggleSettingsPanel} $isDarkMode={isDarkMode}>&times;</CloseButton>
                </SettingsHeader>
                <ProfileInfo $isDarkMode={isDarkMode}>
                    <Avatar src={avatarUrl} alt="Avatar" />
                    <p>{userData.nome}</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>ID: {userData.id}</p>
                </ProfileInfo>
                <SettingsList>
                    {settingsItems.map(item => (
                        <SettingsItem key={item.name} onClick={item.action} $isDarkMode={isDarkMode}>
                            {item.name}
                        </SettingsItem>
                    ))}
                </SettingsList>
            </SettingsPanelContainer>
        );
    };

    // MAPEAMENTO DE COMPONENTES
    const componentMap = {
        tasks: ComponentTasks,
        calendar: ComponentCalendar,
        panel: ComponentPanel,
        list: ComponentList,
        ia: ComponentIA,
        chat: ComponentChat,
    };
    const CurrentComponent = componentMap[activeSection] || ComponentTasks;

    // RENDER PRINCIPAL
    return (
        <HomeBody>
            <LayoutContainer $isDarkMode={isDarkMode}>
                {/* TOP BAR ATUALIZADO COM NOME DO USUÁRIO */}
                <TopBar>
                    <Logo src={logoMindFlow} alt="MindFlow Logo" />

                    {/* ÁREA DO USUÁRIO COM NOME E FOTO */}
                    <div
                        onClick={toggleSettingsPanel}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            padding: '5px 10px',
                            borderRadius: '8px',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                        <span style={{
                            color: '#333',
                            fontWeight: '500',
                            fontSize: '14px',
                            fontFamily: 'Arial, sans-serif'
                        }}>
                            {userName}
                        </span>
                        <Avatar src={avatarUrl} alt="Perfil do Usuário" />
                    </div>

                    <AnimatedBorder />
                </TopBar>

                {/* SIDEBAR */}
                <Sidebar>
                    <SidebarLink onClick={() => handleNavClick('tasks')} $isActive={activeSection === 'tasks'}><img src={IconNotes} alt="Tarefas" /></SidebarLink>
                    <SidebarLink onClick={() => handleNavClick('calendar')} $isActive={activeSection === 'calendar'}><img src={IconCalendar} alt="Calendário" /></SidebarLink>
                    <SidebarLink onClick={() => handleNavClick('panel')} $isActive={activeSection === 'panel'}><img src={IconDashboard} alt="Painel" /></SidebarLink>
                    <SidebarLink onClick={() => handleNavClick('list')} $isActive={activeSection === 'list'}><img src={IconList} alt="Lista / Backlog" /></SidebarLink>
                    <LogoutLink onClick={() => handleNavClick('exit')} $isActive={activeSection === 'exit'}><img src={IconExit} alt="Exit" /></LogoutLink>
                </Sidebar>

                {/* ÁREA DE CONTEÚDO */}
                <ContentArea>
                    <CurrentComponent />
                </ContentArea>

                {/* MODAIS */}
                {isModalOpen && (
                    <TaskModal
                        onClose={closeModal}
                        onSave={editingTaskId ? handleEditTask : handleAddTask}
                        onDelete={handleDeleteTask}
                        sprints={Object.values(sprints)}
                        taskData={taskToEdit}
                    />
                )}

                {isSprintModalOpen && (
                    <SprintModal
                        onClose={handleCloseSprintModal}
                        onSave={handleSaveSprint}
                        onDelete={handleDeleteSprint}
                        sprintData={sprintToEdit}
                    />
                )}

                {isAvatarModalOpen && <AvatarUploadModal onClose={() => setIsAvatarModalOpen(false)} />}

                {isNotificationModalOpen && <NotificationModal />}

                {/* BOTÕES FLUTUANTES */}
                <FloatingButtonsContainer>
                    <FloatingButton $type="chat" onClick={(toggleChat)}>
                        <img src="\src\assets\ia_clara.png" alt="" />
                    </FloatingButton>
                </FloatingButtonsContainer>

                <UserSettingsPanel />
                <ChatPanel
                    open={isChatOpen}
                    onClose={toggleChat}
                    isDarkMode={isDarkMode}
                />
            </LayoutContainer>
        </HomeBody>
    );
}

export default Dashboard;