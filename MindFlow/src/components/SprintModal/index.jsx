import React, { useState } from 'react';
import { 
    ModalOverlay, 
    ModalContent, 
    CloseButton, 
    ModalTitle,
    FormGroup,
    FormLabel, 
    FormInput, 
    SaveButton, 
    // Se você tiver um componente para o botão de deletar (como PriorityButton), importe-o
    // Vou presumir que você tem um estilo básico, mas pode adaptar.
} from './styles'; // Ajuste o caminho se necessário


// O componente agora recebe sprintData e onDelete
function SprintModal({ onClose, onSave, onDelete, sprintData }) { 
    
    // Determina se estamos editando ou criando
    const isEditing = !!sprintData;

    // Inicialização do estado: usa dados da sprint se for edição, ou valores padrão para criação
    const [currentSprintData, setCurrentSprintData] = useState({
        ...(sprintData || {}),
        
        // Garante que o ID esteja presente se for edição
        id: sprintData?.id, 
        // Garante valores padrão
        name: sprintData?.name || '',
        startDate: sprintData?.startDate || '',
        endDate: sprintData?.endDate || '', 
    });

    
    const handleChange = (e) => {
        const { id, value } = e.target;
        setCurrentSprintData(prevData => ({
            ...prevData,
            [id]: value, 
        }));
    };
    
    const handleDelete = () => {
        if (window.confirm(`Tem certeza que deseja deletar a sprint "${currentSprintData.name}"? As tarefas nela serão movidas para o Backlog.`)) {
            // Chama a função onDelete passada pelo Dashboard
            onDelete(currentSprintData.id);
            onClose(); 
        }
    };
    

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validação básica
        if (!currentSprintData.name || !currentSprintData.startDate || !currentSprintData.endDate) {
            alert("Por favor, preencha todos os campos da Sprint.");
            return;
        }

        // Verifica se a data de início é anterior ou igual à data de fim
        if (new Date(currentSprintData.startDate) > new Date(currentSprintData.endDate)) {
            alert("A data de início não pode ser posterior à data de término.");
            return;
        }

        // Chama a função onSave (que no Dashboard será handleSaveSprint)
        onSave(currentSprintData); 
        // Não chame onClose aqui, onSave no Dashboard já chama o close se for criação/edição.
        // Mas se a função onSave não fechar o modal, chame onClose:
        onClose(); 
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <CloseButton onClick={onClose}>&times;</CloseButton>
                <ModalTitle>{isEditing ? 'Editar Sprint' : 'Adicionar Nova Sprint'}</ModalTitle>
                
                <form onSubmit={handleSubmit}>
                    
                    <FormGroup>
                        <FormLabel htmlFor="name">Nome da Sprint</FormLabel>
                        <FormInput id="name" type="text" placeholder="Ex: Sprint 1 - Core Features" 
                            value={currentSprintData.name}
                            onChange={handleChange}
                            required 
                        />
                    </FormGroup>
                    
                    <FormGroup>
                        <FormLabel htmlFor="startDate">Data de Início</FormLabel>
                        <FormInput id='startDate' type="date"
                            value={currentSprintData.startDate}
                            onChange={handleChange}
                            required 
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="endDate">Data de Término</FormLabel>
                        <FormInput id='endDate' type="date"
                            value={currentSprintData.endDate}
                            onChange={handleChange}
                            required 
                        />
                    </FormGroup>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', gap: '10px' }}>
                        <SaveButton type="submit" style={{ flexGrow: 1 }}>
                            {isEditing ? 'Salvar Edição' : 'Criar Sprint'}
                        </SaveButton>

                        {isEditing && (
                            // Use um estilo que denote exclusão
                            <SaveButton 
                                type="button" 
                                onClick={handleDelete} 
                                style={{ 
                                    flexGrow: 0, 
                                    backgroundColor: '#ff4d4f', // Ex: Vermelho para deletar
                                    width: '100px' 
                                }}
                            >
                                Deletar
                            </SaveButton>
                        )}
                    </div> 
                </form>

            </ModalContent>
        </ModalOverlay>
    );
}

export default SprintModal;