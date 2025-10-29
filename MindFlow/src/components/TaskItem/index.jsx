// src/components/CardTask/index.jsx

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

import { 
    TaskCard, 
    TaskHeader, 
    TaskTitle, 
    PriorityLabel, 
    TaskBody, 
    TaskDetail,
} from './styles.js'; 

/**
 * Componente que renderiza um único cartão de tarefa.
 * @param {object} task - Os dados da tarefa (name, description, dueDate, priority).
 * @param {number} index - O índice da tarefa dentro da lista (obrigatório pelo Draggable).
 * @param {function} onTaskClick - NOVO: Função chamada ao clicar no cartão para edição.
 */
// 💡 MUDANÇA 1: Adicionar onTaskClick aos props
function TaskItem({ task, index, onTaskClick }) { 
    
    const formattedDate = new Date(task.dueDate).toLocaleDateString('pt-BR');

    const getPriorityText = (priority) => {
        switch (priority) {
            case 'low':
                return 'Baixa';
            case 'medium':
                return 'Média';
            case 'high':
                return 'Alta';
            default:
                return 'Sem Prioridade';
        }
    };
    
    return (
        <Draggable 
            draggableId={task.id} 
            index={index}          
        >
            {(provided, snapshot) => (
                <TaskCard 
                    $priority={task.priority}
                    ref={provided.innerRef} 
                    {...provided.draggableProps} 
                    {...provided.dragHandleProps} 
                    $isDragging={snapshot.isDragging}
                    
                    // 💡 MUDANÇA 2: Adicionar o handler de clique
                    onClick={() => onTaskClick(task.id)} 
                >
                    
                    <TaskHeader>
                        <TaskTitle>{task.name}</TaskTitle>
                        <PriorityLabel $priority={task.priority}>
                            {getPriorityText(task.priority)}
                        </PriorityLabel>
                    </TaskHeader>

                    <TaskBody>
                        {task.description && (
                            <TaskDetail>
                                <strong>Descrição:</strong> {task.description}
                            </TaskDetail>
                        )}
                        
                        <TaskDetail>
                            <strong>Entrega:</strong> {formattedDate}
                        </TaskDetail>
                    </TaskBody>

                </TaskCard>
            )}
        </Draggable>
    );
}

export default TaskItem;