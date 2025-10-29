import React, { useState } from 'react';

import { 
    ModalOverlay, 
    ModalContent, 
    CloseButton, 
    ModalTitle,
    
    FormGroup,
    FormLabel, 
    FormInput, 
    FormTextarea, 
    SaveButton, 
    
    PriorityOptions,
    PriorityButton,
} from './styles.js'; 


function TaskModal({ onClose, onSave, onDelete, sprints, taskData }) { 
    
    const isEditing = !!taskData;

    // 💡 INICIALIZAÇÃO DE ESTADO CORRIGIDA E MAIS ROBUSTA
    // Garante que todos os campos tenham valores padrão, especialmente 'dueDate' como string vazia.
    const [currentTaskData, setCurrentTaskData] = useState({
        // Espalha os dados existentes da tarefa (se estiver editando)
        ...(taskData || {}),
        
        // Garante valores padrão (para criação) e corrige valores potencialmente nulos para string vazia
        id: taskData?.id, 
        name: taskData?.name || '',
        description: taskData?.description || '', 
        dueDate: taskData?.dueDate || '',     // CORREÇÃO DE DUE DATE
        priority: taskData?.priority || 'medium',
        sprintId: taskData?.sprintId || null,
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
        }
    };

    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // ✅ CORREÇÃO: Usando currentTaskData para validação
        if (!currentTaskData.name || !currentTaskData.dueDate) {
            alert("Por favor, preencha o nome e a data de entrega.");
            return;
        }

        onSave(currentTaskData); 
        onClose(); 
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <CloseButton onClick={onClose}>&times;</CloseButton>
                <ModalTitle>{isEditing ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}</ModalTitle>
                
                <form onSubmit={handleSubmit}>
                    
                    <FormGroup>
                        <FormLabel htmlFor="name">Nome da Tarefa</FormLabel>
                        <FormInput id="name" type="text" placeholder="Título" 
                            // ✅ CORREÇÃO: Variável currentTaskData está correta agora
                            value={currentTaskData.name}
                            onChange={handleChange}
                            required 
                        />
                    </FormGroup>
                    
                    <FormGroup>
                        <FormLabel htmlFor="description">Descrição da Tarefa</FormLabel>
                        <FormTextarea id="description" type="text" placeholder="Descrição"
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
                            >
                                Baixa
                            </PriorityButton>
                            <PriorityButton 
                                $level="medium" 
                                $isActive={currentTaskData.priority === 'medium'}
                                onClick={() => handlePriorityChange('medium')}
                            >
                                Média
                            </PriorityButton>
                            <PriorityButton 
                                $level="high" 
                                $isActive={currentTaskData.priority === 'high'}
                                onClick={() => handlePriorityChange('high')}
                            >
                                Alta
                            </PriorityButton>
                        </PriorityOptions>
                    </FormGroup>

                    {/* CAMPO: SELEÇÃO DE SPRINT */}
                    <FormGroup>
                        <FormLabel htmlFor="sprintId">Associar à Sprint</FormLabel>
                        <select 
                            id="sprintId" 
                            value={currentTaskData.sprintId === null ? 'null' : currentTaskData.sprintId} 
                            onChange={handleChange}
                            style={{ 
                                width: '100%', 
                                padding: '10px', 
                                border: '1px solid #ccc', 
                                borderRadius: '4px',
                                boxSizing: 'border-box'
                            }}
                        >
                            {/* Opção padrão para tarefas no Backlog */}
                            <option value="null">Nenhuma (Backlog)</option>
                            
                            {/* Mapeia as Sprints disponíveis */}
                            {sprints && sprints.map(sprint => (
                                <option key={sprint.id} value={sprint.id}>
                                    {sprint.name} ({sprint.startDate} a {sprint.endDate})
                                </option>
                            ))}
                        </select>
                    </FormGroup>
                    
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                        <SaveButton type="submit" style={{ width: isEditing ? 'calc(70% - 5px)' : '100%' }}>
                            {isEditing ? 'Salvar Edição' : 'Salvar Tarefa'}
                        </SaveButton>

                        {/* Botão de Deletar SÓ aparece em modo de edição */}
                        {isEditing && (
                            <PriorityButton 
                                onClick={handleDelete} 
                                $level="high" 
                                style={{ backgroundColor: '#ff4d4f', color: 'white', width: '30%', marginLeft: '5px' }}
                            >
                                Deletar
                            </PriorityButton>
                        )}
                    </div> 
                </form>

            </ModalContent>
        </ModalOverlay>
    );
}

export default TaskModal;