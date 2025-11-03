import React, { useState } from 'react';

// 💡 CORREÇÃO: Usando os nomes dos componentes estilizados definidos no styles.js
import {
    ModalOverlay,
    TaskModalContent, // <-- Renomeado
    ModalCloseButton, // <-- Renomeado
    ModalTitle,

    FormGroup,
    FormLabel,
    FormInput,
    FormTextarea,
    SaveButton,
    
    // Novo botão Deletar para melhor controle de estilo
    DeleteButton, 

    PriorityOptions,
    PriorityButton,
    TaskSprintSelect, // <-- Novo componente estilizado para o <select>
} from './styles.js';


function TaskModal({ onClose, onSave, onDelete, sprints, taskData }) {

    const isEditing = !!taskData;
    
    const [currentTaskData, setCurrentTaskData] = useState(() => {
        const baseData = {
            name: taskData?.name || '',
            description: taskData?.description || '',
            dueDate: taskData?.dueDate || '',
            priority: taskData?.priority || 'medium',
            sprintId: taskData?.sprintId || null,
        };

        if (taskData && taskData.id) {
            baseData.id = taskData.id;
            baseData.status = taskData.status; 
        }

        return baseData;
    });


    const handleChange = (e) => {
        const { id, value } = e.target;

        // Lógica de tratamento do sprintId: Converte "null" string em null real
        const finalValue = id === 'sprintId' && value === 'null' ? null : value;

        setCurrentTaskData(prevData => ({
            ...prevData,
            [id]: finalValue,
        }));
    };


    const handlePriorityChange = (level) => {
        setCurrentTaskData(prevData => ({
            ...prevData,
            priority: level
        }));
    };

    const handleDelete = () => {
        if (window.confirm("Tem certeza que deseja deletar esta tarefa?")) {
            onDelete(currentTaskData.id);
            onClose(); // Fechar o modal após deletar
        }
    };


    const handleSubmit = (e) => {
        e.preventDefault();

        if (!currentTaskData.name || !currentTaskData.dueDate) {
            alert("Por favor, preencha o nome e a data de entrega.");
            return;
        }

        const payload = { ...currentTaskData };
        if (!isEditing) {
            delete payload.id;
        }

        onSave(payload);
        onClose();
    };

    return (
        <ModalOverlay onClick={onClose}>
            {/* 💡 CORREÇÃO: TaskModalContent no lugar de ModalContent */}
            <TaskModalContent onClick={e => e.stopPropagation()}> 
                {/* 💡 CORREÇÃO: ModalCloseButton no lugar de CloseButton */}
                <ModalCloseButton onClick={onClose}>&times;</ModalCloseButton> 
                <ModalTitle>{isEditing ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}</ModalTitle>

                <form onSubmit={handleSubmit}>

                    <FormGroup>
                        <FormLabel htmlFor="name">Nome da Tarefa</FormLabel>
                        <FormInput id="name" type="text" placeholder="Título"
                            value={currentTaskData.name}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="description">Descrição da Tarefa</FormLabel>
                        <FormTextarea id="description" placeholder="Descrição"
                            value={currentTaskData.description}
                            onChange={handleChange}
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="dueDate">Data de Entrega</FormLabel>
                        <FormInput id='dueDate' type="date" placeholder='Data'
                            value={currentTaskData.dueDate}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>

                    {/* GRUPO DE PRIORIDADE */}
                    <FormGroup>
                        <FormLabel htmlFor="priority">Prioridade</FormLabel>
                        <PriorityOptions>
                            <PriorityButton
                                $level="low"
                                $isActive={currentTaskData.priority === 'low'}
                                onClick={() => handlePriorityChange('low')}
                                type="button" 
                            >
                                Baixa
                            </PriorityButton>
                            <PriorityButton
                                $level="medium"
                                $isActive={currentTaskData.priority === 'medium'}
                                onClick={() => handlePriorityChange('medium')}
                                type="button" 
                            >
                                Média
                            </PriorityButton>
                            <PriorityButton
                                $level="high"
                                $isActive={currentTaskData.priority === 'high'}
                                onClick={() => handlePriorityChange('high')}
                                type="button" 
                            >
                                Alta
                            </PriorityButton>
                        </PriorityOptions>
                    </FormGroup>

                    {/* CAMPO: SELEÇÃO DE SPRINT */}
                    <FormGroup>
                        <FormLabel htmlFor="sprintId">Associar à Sprint</FormLabel>
                        {/* 💡 CORREÇÃO: Usando TaskSprintSelect para remover o estilo inline */}
                        <TaskSprintSelect
                            id="sprintId"
                            value={currentTaskData.sprintId === null ? 'null' : currentTaskData.sprintId}
                            onChange={handleChange}
                            // O estilo inline foi removido e será definido no styles.js
                        >
                            <option value="null">Nenhuma (Backlog)</option>
                            {sprints && sprints.map(sprint => (
                                <option key={sprint.id} value={sprint.id}>
                                    {sprint.name} ({sprint.startDate} a {sprint.endDate})
                                </option>
                            ))}
                        </TaskSprintSelect>
                    </FormGroup>


                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '20px' }}>
                        <SaveButton type="submit" style={{ flexGrow: isEditing ? 1 : 1 }}> 
                            {isEditing ? 'Salvar Edição' : 'Adicionar Tarefa'}
                        </SaveButton>

                        {/* Botão de Deletar SÓ aparece em modo de edição */}
                        {isEditing && (
                            <DeleteButton
                                onClick={handleDelete}
                                type="button" 
                                style={{ flexGrow: 0.5 }}
                            >
                                Deletar
                            </DeleteButton>
                        )}
                    </div>
                </form>

            </TaskModalContent>
        </ModalOverlay>
    );
}

export default TaskModal;