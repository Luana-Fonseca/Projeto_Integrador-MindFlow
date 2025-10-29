import styled, { keyframes,css } from 'styled-components';

// 1. Contêiner Principal da Coluna (Request 1 e 3)

export const ColumnContainer = styled.div`

    margin: 8px;

    border: 2px solid #4914daff;

    border-radius: 8px;

    width: 300px; /* Largura fixa para cada coluna */

    background-color: #8c67f3ff; /* Cor de fundo da coluna (Request 3) */

    display: flex;

    flex-direction: column;



    ${props => props.$isDraggingOver && css`

        /* Feedback visual quando algo está sendo arrastado sobre a coluna */

        background-color: #e3f2fd;

    `}



   

`;



// 2. Título da Coluna

export const Title = styled.h3`

    padding: 8px;

    margin: 0;

    font-size: 1.2em;

    color: #ffffffff;

    border-bottom: 1px solid lightgrey;

    text-align: center;

`;



// 3. Lista de Tarefas (Onde os cards caem)

// O padding e o min-height garantem que os cards caibam e o droppable tenha altura (Request 1)

export const TaskList = styled.div`

    padding: 8px;

    transition: background-color 0.2s ease;

    flex-grow: 1; /* Garante que a lista preencha o espaço restante na coluna */

    min-height: 100px; /* Garante que a área de drop seja visível */



    /* Garante que o item sendo arrastado não fique cortado */

    & > * {

        margin-bottom: 8px;

    }

`;