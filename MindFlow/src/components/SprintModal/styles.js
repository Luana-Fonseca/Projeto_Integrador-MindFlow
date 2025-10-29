import styled, { keyframes } from 'styled-components';

// Animação de entrada do modal
const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

const slideDown = keyframes`
    from { transform: translateY(-50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
`;


export const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: ${fadeIn} 0.3s ease-out;
`;

export const ModalContent = styled.div`
    background-color: #fff;
    padding: 30px;
    border-radius: 12px;
    width: 90%;
    max-width: 450px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    position: relative;
    animation: ${slideDown} 0.4s ease-out;
`;

export const CloseButton = styled.button`
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #333;
    transition: color 0.2s;

    &:hover {
        color: #ff4d4f;
    }
`;

export const ModalTitle = styled.h2`
    color: #333;
    margin-bottom: 25px;
    font-size: 1.5em;
    border-bottom: 2px solid #5a52d9;
    padding-bottom: 5px;
`;

export const FormGroup = styled.div`
    margin-bottom: 18px;
`;

export const FormLabel = styled.label`
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #555;
    font-size: 0.95em;
`;

export const FormInput = styled.input`
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1em;
    box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.2s;
    
    &:focus {
        border-color: #5a52d9;
        box-shadow: 0 0 0 3px rgba(90, 82, 217, 0.2);
        outline: none;
    }

    &[type="date"] {
        /* Garante que o input de data tenha a mesma altura */
        line-height: normal; 
    }
`;

export const SaveButton = styled.button`
    padding: 12px 20px;
    background-color: #5a52d9;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1em;
    font-weight: bold;
    transition: background-color 0.2s, transform 0.1s;
    flex-grow: 1; /* Para funcionar com flex no container pai */

    &:hover {
        background-color: #4841b5;
    }

    &:active {
        transform: scale(0.98);
    }
    
    // Estilo específico para o botão de deletar (se for necessário)
    ${props => props.type === 'button' && props.style && props.style.backgroundColor === '#ff4d4f' && `
        &:hover {
            background-color: #cc0000 !important;
        }
    `}
`;

// Note: Não incluí PriorityButton/PriorityOptions pois não são usados no SprintModal.