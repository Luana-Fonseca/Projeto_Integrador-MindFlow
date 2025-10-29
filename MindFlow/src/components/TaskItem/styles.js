import styled, { css } from 'styled-components';

// Função para definir a cor da prioridade (as mesmas do Modal)
const getPriorityColors = (level) => {
  switch (level) {
    case 'low':
      return { background: '#E6FFD8', text: '#389E0F', border: '#B7EB8F' }; // Verde claro
    case 'medium':
      return { background: '#FFFBE6', text: '#D48806', border: '#FFE58F' }; // Amarelo
    case 'high':
      return { background: '#FFF1F0', text: '#CF1322', border: '#FFA39E' }; // Vermelho claro
    default:
      return { background: '#F0F5FF', text: '#096DD9', border: '#BAE7FF' };
  }
};

export const TaskCard = styled.div`
  background-color: #ffffffff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  padding: 15px;
  margin-bottom: 15px;
  transition: transform 0.2s;
  
  /* Largura máxima que definimos anteriormente */
  width: 100%; 
  max-width: 450px; 

  /* 💡 MUDANÇA AQUI: Borda baseada na Prioridade */
  ${({ $priority }) => {
    const colors = getPriorityColors($priority);
    // Aplica uma borda esquerda mais grossa com a cor da prioridade
    return css`
      border-left: 5px solid ${colors.text}; 
      border-right: 1px solid ${colors.text};
      border-top: 1px solid ${colors.text};
      border-bottom: 1px solid ${colors.text};
    `;
  }}
  
  
  padding-left: 10px; 
  

  &:hover {
    transform: translateY(-2px);
    ${({ $priority }) => {
    const colors = getPriorityColors($priority);
    // Aplica uma borda esquerda mais grossa com a cor da prioridade
    return css`
      box-shadow: 0 6px 12px ${colors.text}; 
    `;
  }}
  }
`;

export const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #252525ff;
  word-break: break-word;
`;

export const TaskTitle = styled.h4`
  margin: 0;
  font-size: 18px;
  color: #333;
  font-weight: 700;
  flex-grow: 1; /* Permite que o título ocupe o espaço */
`;

export const PriorityLabel = styled.span`
  /* Estilização baseada na prop $priority */
  ${({ $priority }) => {
    const colors = getPriorityColors($priority);
    return css`
      background-color: ${colors.background};
      color: ${colors.text};
      border: 1px solid ${colors.border};
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap; /* Impede quebra de linha */
      margin-left: 10px;
    `;
  }}
`;

export const TaskBody = styled.div`
  font-size: 14px;
  color: #667;
  word-break: break-word;
`;

export const TaskDetail = styled.p`
  margin: 5px 0;

  strong {
      color: #333;
      font-weight: 600;
      margin-right: 5px;
  }
`;