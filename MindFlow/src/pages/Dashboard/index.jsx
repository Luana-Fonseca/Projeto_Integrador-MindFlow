import React, { useState, useEffect } from 'react'; // Adicionado useEffect
// Importações de Componentes
import TaskModal from '../../components/TaskModal/index.jsx';
import ColunaTask from '../../components/ColumnTask';
import SprintModal from '../../components/SprintModal';
import StatusChart from '../../components/StatusChart'; // NOVO: Chart Real
import BurndownChart from '../../components/BurndownChart'; // NOVO: Chart Real
import PriorityMatrixChart from '../../components/PriorityMatrixChart'; // NOVO: Chart Real

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
    // Estilos do Painel
    PanelContainer,
    ChartWrapper,
    ChartArea,
    ArrowButton,
    // Estilos do Backlog
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
} from './styles.js';

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
import genericAvatar from '../../assets/Generic_avatar.png';
import IconNotes from '../../assets/nota_2.png';
import IconCalendar from '../../assets/calendario_1.png';
import IconDashboard from '../../assets/painel-do-painel_1.png';
import IconIA from '../../assets/tecnologia-de-ia_1.png';
import IconChat from '../../assets/mensagens_1.png';
import IconList from '../../assets/lista_1.png';
import IconExit from '../../assets/sair-alt_1.png';

// Configuração do Localizer do Calendário
const locales = {
    'pt-BR': ptBR,
};
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { locale: ptBR }),
    getDay,
    locales,
});

// --- DADOS INICIAIS (MANTIDOS) ---

const today = new Date();
const initialSprints = {
    'sprint-1': {
        id: 'sprint-1',
        name: 'Sprint 1 - Kickoff',
        startDate: today.toISOString().split('T')[0],
        endDate: addDays(today, 13).toISOString().split('T')[0],
        goal: 'Concluir a base do Dashboard e o Kanban',
    },
};

const initialData = {
    columns: {
        'column-to-do': {
            id: 'column-to-do',
            title: 'A Fazer (Backlog)',
            taskIds: ['task-1', 'task-2', 'task-3'],
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
    tasks: {
        'task-1': {
            id: 'task-1',
            name: 'Comprar Material',
            description: 'Papel e canetas para o projeto.',
            dueDate: '2025-11-05',
            priority: 'medium',
            sprintId: 'sprint-1',
        },
        'task-2': {
            id: 'task-2',
            name: 'Reunião com Cliente',
            description: 'Apresentar o protótipo V2.',
            dueDate: '2025-10-30',
            priority: 'high',
            sprintId: 'sprint-1',
        },
        'task-3': {
            id: 'task-3',
            name: 'Definir Estrutura de Rotas',
            description: 'Backlog para o próximo ciclo.',
            dueDate: '2025-11-20',
            priority: 'low',
            sprintId: null,
        },
    },
    columnOrder: ['column-to-do', 'column-in-progress', 'column-done'],
};

// --- CONFIGURAÇÃO DO CARROSSEL DE CHARTS ---

const CHART_COMPONENTS = {
    'Burndown Chart': BurndownChart,
    'Status Overview': StatusChart,
    'Priority Matrix': PriorityMatrixChart,
};
const CHART_TITLES = Object.keys(CHART_COMPONENTS);

// --- COMPONENTES DE SEÇÃO SIMPLES (MANTIDOS) ---
const ComponentIA = () => <div><h2>Conteúdo: Inteligência Artificial</h2></div>;
const ComponentChat = () => <div><h2>Conteúdo: Chat / Mensagens</h2></div>;
const ComponentExit = () => <div><h2>Sair</h2></div>;


// --- COMPONENTE DASHBOARD PRINCIPAL (FUNÇÕES E ESTADOS) ---

function Dashboard() {
    // ESTADOS
    const [kanbanData, setKanbanData] = useState(initialData);
    const [sprints, setSprints] = useState(initialSprints);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('tasks');
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [sprintToEdit, setSprintToEdit] = useState(null);
    const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const taskToEdit = editingTaskId ? kanbanData.tasks[editingTaskId] : null;

    const toggleSettingsPanel = () => {
        setIsSettingsPanelOpen(prev => !prev);
    };

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    // FUNÇÕES DE CONTROLE DE MODAL E NAVEGAÇÃO
    const openModal = (taskId = null) => {
        setEditingTaskId(taskId);
        setIsModalOpen(true);
    }
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTaskId(null);
    }
    const handleNavClick = (section) => setActiveSection(section);

    // FUNÇÕES DE SPRINTS
    const handleOpenSprintModal = (sprint = null) => {
        setSprintToEdit(sprint);
        setIsSprintModalOpen(true);
    };
    const handleCloseSprintModal = () => {
        setIsSprintModalOpen(false);
        setSprintToEdit(null);
    };
    const handleSaveSprint = (sprintData) => {
        setSprints(prevSprints => {
            if (sprintData.id) {
                return { ...prevSprints, [sprintData.id]: sprintData };
            }
            const newSprintId = `sprint-${Date.now()}`;
            return { ...prevSprints, [newSprintId]: { ...sprintData, id: newSprintId } };
        });
        handleCloseSprintModal();
    };

    const handleQuickAssignToSprint = (taskId, newSprintId) => {
        setKanbanData(prevData => ({
            ...prevData,
            tasks: {
                ...prevData.tasks,
                [taskId]: {
                    ...prevData.tasks[taskId],
                    sprintId: newSprintId === 'null' ? null : newSprintId, // 'null' é para remover
                }
            }
        }));
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

    // FUNÇÕES DE TAREFAS (Simplificadas, mas funcionais)
    const handleAddTask = (newTaskData) => {
        const newTaskId = `task-${Date.now()}`;
        setKanbanData(prevData => {
            const newTasks = {
                ...prevData.tasks,
                [newTaskId]: { id: newTaskId, ...newTaskData, status: 'to-do' }
            };
            const toDoColumn = prevData.columns['column-to-do'];
            const newToDoTaskIds = [...toDoColumn.taskIds, newTaskId];
            const newToDoColumn = { ...toDoColumn, taskIds: newToDoTaskIds };
            return { ...prevData, tasks: newTasks, columns: { ...prevData.columns, 'column-to-do': newToDoColumn } };
        });
        closeModal();
    };

    const handleDeleteTask = (taskId) => {
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
    };

    const handleEditTask = (editedTaskData) => {
        setKanbanData(prevData => ({
            ...prevData,
            tasks: {
                ...prevData.tasks,
                [editedTaskData.id]: editedTaskData,
            }
        }));
        closeModal();
    };

    // LÓGICA DE DRAG AND DROP (onDragEnd)
    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const startColumn = kanbanData.columns[source.droppableId];
        const finishColumn = kanbanData.columns[destination.droppableId];

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

        const startTaskIds = Array.from(startColumn.taskIds);
        startTaskIds.splice(source.index, 1);
        const finishTaskIds = Array.from(finishColumn.taskIds);
        finishTaskIds.splice(destination.index, 0, draggableId);

        setKanbanData(prevData => ({
            ...prevData,
            columns: {
                ...prevData.columns,
                [startColumn.id]: { ...startColumn, taskIds: startTaskIds },
                [finishColumn.id]: { ...finishColumn, taskIds: finishTaskIds },
            },
        }));
    };

    const onBacklogDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination || destination.index === source.index) {
            return;
        }

        // Como o Backlog não tem colunas, apenas reordenamos o array de IDs no 'column-to-do'
        // que, por padrão, é o nosso backlog principal.

        // NOTA: Se o Backlog deve incluir Em Andamento, precisaríamos de uma nova estrutura de ordem.
        // Por simplicidade, vamos usar o 'column-to-do' como proxy para a ordem do Backlog.

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

    // COMPONENTE: QUADRO KANBAN (tasks)
    const ComponentTasks = () => (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <TaskListContainer>

                    <AddButton onClick={() => openModal(null)}>
                        <h2>+</h2>
                    </AddButton>

                    {kanbanData.columnOrder.map((columnId) => {
                        const column = kanbanData.columns[columnId];
                        const tasks = column.taskIds.map(taskId => kanbanData.tasks[taskId]);

                        return (
                            <ColunaTask
                                key={column.id}
                                column={column}
                                onTaskClick={openModal}
                                tasks={tasks}
                            />
                        );
                    })}
                </TaskListContainer>
            </DragDropContext>
        </>
    );

    // COMPONENTE: CALENDÁRIO / PLANEJAMENTO DE SPRINT (calendar)
    const ComponentCalendar = () => {
        const [currentDate, setCurrentDate] = useState(new Date());
        const [currentView, setCurrentView] = useState(Views.MONTH);

        const taskEvents = Object.values(kanbanData.tasks).map(task => {
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
        });

        const sprintEvents = Object.values(sprints).map(sprint => {
            const startDate = new Date(sprint.startDate);
            const endDate = new Date(sprint.endDate);
            endDate.setDate(endDate.getDate() + 1);

            return {
                id: sprint.id,
                title: `[S] ${sprint.name}`,
                start: startDate,
                end: endDate,
                isSprint: true,
                priority: 'high',
            };
        });

        const allEvents = [...taskEvents, ...sprintEvents];

        return (
            <div style={{ height: '80vh', backgroundColor: 'white', padding: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>

                    <h2>Planejamento de Sprints</h2>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

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
                                >
                                    {sprint.name}
                                </SprintItem>
                            ))}
                        </SprintList>

                        {/* AddButton com estilos para texto e cor branca */}
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
                    localizer={localizer}
                    events={allEvents}
                    startAccessor="start"
                    endAccessor="end"
                    date={currentDate}
                    view={currentView}
                    onNavigate={(newDate) => setCurrentDate(newDate)}
                    onView={(newView) => setCurrentView(newView)}
                    messages={{
                        next: "Próximo", previous: "Anterior", today: "Hoje",
                        month: "Mês", week: "Semana", day: "Dia",
                    }}
                    eventPropGetter={(event) => {
                        const style = {};
                        if (event.isSprint) {
                            style.backgroundColor = '#5a52d9cc'; style.color = 'white'; style.border = '1px solid #5a52d9';
                        } else {
                            const colors = {
                                high: { backgroundColor: '#FFDAD8', color: '#F5222D', borderColor: '#FFA39E' },
                                medium: { backgroundColor: '#FFF7AE', color: '#FAAD14', borderColor: '#FFE58F' },
                                low: { backgroundColor: '#D9F7BE', color: '#52C41A', borderColor: '#B7EB8F' },
                            };
                            Object.assign(style, colors[event.priority] || {});
                        }
                        return { style };
                    }}
                />
            </div>
        );
    };

    // COMPONENTE: PAINEL DE CONTROLE (Panel) com Carrossel de Charts
    const ComponentPanel = () => {
        const [currentChartIndex, setCurrentChartIndex] = useState(0);

        const handleNext = () => {
            setCurrentChartIndex(prev => (prev + 1) % CHART_TITLES.length);
        };

        const handlePrev = () => {
            setCurrentChartIndex(prev => (prev - 1 + CHART_TITLES.length) % CHART_TITLES.length);
        };

        const CurrentChartTitle = CHART_TITLES[currentChartIndex];
        const CurrentChartComponent = CHART_COMPONENTS[CurrentChartTitle];

        return (
            <PanelContainer>
                <h2>{CurrentChartTitle}</h2>

                <ChartWrapper>
                    <ArrowButton onClick={handlePrev}>{"<"}</ArrowButton>

                    <ChartArea>
                        <CurrentChartComponent
                            data={kanbanData}
                            sprints={sprints}
                        />
                    </ChartArea>

                    <ArrowButton onClick={handleNext}>{">"}</ArrowButton>
                </ChartWrapper>
            </PanelContainer>
        );
    };

    // NOVO COMPONENTE: BACKLOG (list)
    const ComponentList = () => {
        // 1. As tarefas no 'column-to-do' (Backlog) determinam a ordem.
        const backlogTaskIds = kanbanData.columns['column-to-do'].taskIds;

        // Filtra e organiza APENAS as tarefas que estão fora das Sprints ativas e Em Andamento/Feitas.
        // Para simplificar o Drag and Drop na lista, vamos focar em reordenar
        // a lista de tarefas da coluna 'A Fazer' (Backlog).

        // Lista de todas as tarefas A FAZER (no order definido pelo array)
        const backlogTasks = backlogTaskIds.map(taskId => kanbanData.tasks[taskId]).filter(task => task);

        return (
            <BacklogContainer>
                <h2>Backlog do Projeto ({backlogTasks.length} Tarefas a Fazer)</h2>

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
                                                    // Handle de arraste:
                                                    {...provided.dragHandleProps}
                                                    $isDragging={snapshot.isDragging}
                                                >
                                                    <div style={{ fontWeight: 'bold' }}>{index + 1}</div> {/* Ordem */}
                                                    <TaskName>{task.name}</TaskName>

                                                    {/* NOVO: SELECT para mudar a Sprint */}
                                                    <TaskSprintSelect
                                                        value={task.sprintId || 'null'} // Usa 'null' para Sprint Global
                                                        onChange={(e) => handleQuickAssignToSprint(task.id, e.target.value)}
                                                    >
                                                        <option value="null">Global (Backlog)</option>
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
                            <p style={{ marginTop: '20px', color: '#666', textAlign: 'center' }}>O Backlog (A Fazer) está vazio!</p>
                        )}
                    </TaskList>
                </DragDropContext>
            </BacklogContainer>
        );
    };

    // =========================================================================
    // NOVO: PAINEL DE CONFIGURAÇÕES LATERAIS
    // =========================================================================

    const UserSettingsPanel = () => {
        // Coloque as configurações aqui
        const settingsItems = [
            { name: "Ver Perfil", action: () => alert("Redirecionar para página de Perfil.") },
            { name: "Mudar Foto/Avatar", action: () => alert("Abrir modal de upload.") },
            { name: "Preferências de Notificação", action: () => alert("Abrir submenu de notificações.") },
            { name: "Modo Escuro / Tema", action: () => alert("Alternar tema.") },
            { name: "Sair / Logout", action: () => alert("Realizar Logout.") },
            {
                name: `Modo Escuro: ${isDarkMode ? 'Ativado' : 'Desativado'}`,
                action: toggleTheme // Chama a nova função
            },
        ];

        return (
            <SettingsPanelContainer $isOpen={isSettingsPanelOpen} $isDarkMode={isDarkMode}>
                <SettingsHeader $isDarkMode={isDarkMode}>
                    <h3>Configurações de Usuário</h3>
                    <CloseButton onClick={toggleSettingsPanel} $isDarkMode={isDarkMode}>&times;</CloseButton>
                </SettingsHeader>

                <ProfileInfo $isDarkMode={isDarkMode}>
                    <Avatar src={genericAvatar} alt="Avatar" />
                    <p>Usuário Ativo (ID: 123)</p>
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

    // Mapeamento de Componentes para a navegação
    const componentMap = {
        tasks: ComponentTasks,
        calendar: ComponentCalendar,
        panel: ComponentPanel,
        list: ComponentList, // <-- AGORA É O BACKLOG
        ia: ComponentIA,
        chat: ComponentChat,
        exit: ComponentExit,
    };

    const CurrentComponent = componentMap[activeSection] || ComponentTasks;

    // ESTRUTURA PRINCIPAL DO DASHBOARD
    return (
        <HomeBody>
            <LayoutContainer $isDarkMode={isDarkMode}>
                {/* TOP BAR */}
                <TopBar>
                    <Logo src={logoMindFlow} alt="MindFlow Logo" />
                    <Avatar src={genericAvatar} alt="Perfil do Usuário" onClick={toggleSettingsPanel} />
                    <AnimatedBorder />
                </TopBar>

                {/* SIDEBAR */}
                <Sidebar>
                    <SidebarLink onClick={() => handleNavClick('tasks')} $isActive={activeSection === 'tasks'}><img src={IconNotes} alt="Tarefas" /></SidebarLink>
                    <SidebarLink onClick={() => handleNavClick('calendar')} $isActive={activeSection === 'calendar'}><img src={IconCalendar} alt="Calendário" /></SidebarLink>
                    <SidebarLink onClick={() => handleNavClick('panel')} $isActive={activeSection === 'panel'}><img src={IconDashboard} alt="Painel" /></SidebarLink>
                    <SidebarLink onClick={() => handleNavClick('list')} $isActive={activeSection === 'list'}><img src={IconList} alt="Lista / Backlog" /></SidebarLink>
                    <SidebarLink onClick={() => handleNavClick('chat')} $isActive={activeSection === 'chat'}><img src={IconChat} alt="Chat" /></SidebarLink>
                    <SidebarLink onClick={() => handleNavClick('ia')} $isActive={activeSection === 'ia'}><img src={IconIA} alt="IA" /></SidebarLink>
                    <SidebarLink onClick={() => handleNavClick('exit')} $isActive={activeSection === 'exit'}><img src={IconExit} alt="Exit" /></SidebarLink>
                </Sidebar>

                {/* ÁREA DE CONTEÚDO */}
                <ContentArea>
                    <CurrentComponent />
                </ContentArea>

                {/* MODAL DE TAREFAS */}
                {isModalOpen && (
                    <TaskModal
                        onClose={closeModal}
                        onSave={editingTaskId ? handleEditTask : handleAddTask}
                        onDelete={handleDeleteTask}
                        sprints={Object.values(sprints)}
                        taskData={taskToEdit}
                    />
                )}

                {/* MODAL DE SPRINT */}
                {isSprintModalOpen && (
                    <SprintModal
                        onClose={handleCloseSprintModal}
                        onSave={handleSaveSprint}
                        onDelete={handleDeleteSprint}
                        sprintData={sprintToEdit}
                    />
                )}

                <UserSettingsPanel />
            </LayoutContainer>
        </HomeBody>
    );
}

export default Dashboard;