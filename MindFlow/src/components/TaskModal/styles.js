import styled, { keyframes, css } from 'styled-components';

// ==========================================================
// 0. FUNÇÕES E KEYFRAMES
// ==========================================================

// Função para retornar as cores baseadas no tema
const getThemeColors = (isDark) => ({
    // Cores Principais
    primary: isDark ? '#8a78ff' : '#5a52d9',
    
    // Fundo
    background: isDark ? '#121212' : '#f0f2f5',   // Fundo da Tela
    sidebarBg: isDark ? '#1e1e1e' : '#ffffff',   // Fundo da Sidebar e Painel
    contentBg: isDark ? '#2c2c2c' : '#ffffff',   // Fundo das Áreas de Conteúdo
    
    // Texto
    text: isDark ? '#ffffff' : '#333333',
    textSecondary: isDark ? '#bbbbbb' : '#666666',
    
    // Borda/Separador
    border: isDark ? '#333333' : '#e0e0e0',
});

const moveGradient = keyframes`
    0% {
        background-position: 0% 50%;
    }
    100% {
        background-position: 100% 50%; 
    }
`;

// Keyframes para a animação de entrada do Modal
const fadeInScale = keyframes`
    from {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }
`;

// Função de cores para o TaskModal (mantida de TaskModal.js)
const getPriorityColors = (level) => {
    switch (level) {
        case 'low':
            return { background: '#D9F7BE', text: '#52C41A', border: '#B7EB8F' }; 
        case 'medium':
            return { background: '#FFF7AE', text: '#FAAD14', border: '#FFE58F' }; 
        case 'high':
            return { background: '#FFDAD8', text: '#F5222D', border: '#FFA39E' }; 
        default:
            return { background: '#E6F7FF', text: '#1890FF', border: '#BAE7FF' };
    }
};

// ==========================================================
// 1. ESTILOS DE LAYOUT PRINCIPAL (MANTIDOS)
// ==========================================================

export const HomeBody = styled.div`
    height: 100vh;
    width: 100vw;
    overflow: hidden; 
`;

export const LayoutContainer = styled.div`
    display: grid;
    grid-template-columns: 80px 1fr; 
    grid-template-rows: 70px 1fr;
    height: 100%;
    width: 100%;
    background-color: ${props => getThemeColors(props.$isDarkMode).background}; 
    color: ${props => getThemeColors(props.$isDarkMode).text};
    transition: background-color 0.3s, color 0.3s;
`;

export const AnimatedBorder = styled.div`
    
    position: absolute;
    bottom: 0; 
    left: 0;
    width: 100%; 
    height: 5px; 
        
    background: linear-gradient(
        to right,
        #fefeffff,
        #000000ff, 
        #5a52d9,
        #fefeffff 
    );
    
    background-size: 200% 50%; 
    animation: ${moveGradient} 4s linear infinite alternate;
`;

export const TopBar = styled.header`
    grid-column: 1 / 3; 
    grid-row: 1 / 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    background-color: ${props => getThemeColors(props.$isDarkMode).sidebarBg};
    border-bottom: none;
    transition: background-color 0.3s, border-color 0.3s;
    position: relative;
`;

export const Logo = styled.img`
    height: 140px;
    width: auto;

    @media (max-width: 768px) {
        height: 150px;
    }
`;

// ==========================================================
// 2. ADDBUTTON (Com animação de fill)
// ==========================================================

export const AddButton = styled.button`
    /* --- Base do Botão --- */
    position: relative;
    overflow: hidden;
    cursor: pointer;
    z-index: 1; 
    
    /* Estilos Visuais Iniciais */
    color: #5a52d9; 
    background-color: #f0f2f5;
    border: solid 2px #5a52d9;
    border-radius: 100%;
    padding: 10px 16px;
    
    /* Transições */
    transition: 
        color 0.3s ease,
        border-color 0.3s ease, 
        transform 0.2s ease; 

    h2 {
        color: #5a52d9;
        font-weight: 400;
        transition: color 0.3s ease;
    }

    /* --- Pseudo-Elemento para o Efeito de Preenchimento --- */
    &::before {
        content: '';
        position: absolute;
        bottom: 0; 
        left: 0;
        width: 100%;
        height: 0;
        
        background-color: ${props => getThemeColors(props.$isDarkMode).primary}; 
        
        z-index: -1;
        
        transition: height 0.3s ease-in-out; 
    }

    /* --- Estado de HOVER --- */
    &:hover {
        color: white; 
        border-color: ${props => getThemeColors(props.$isDarkMode).primary}; 
        transform: scale(1.05);
    }
    
    &:hover h2 {
        color: white;
    }
    
    &:hover::before {
        height: 100%;
    }
`;

export const Avatar = styled.img`
    height: 40px;
    width: 40px;
    border-radius: 50%;
    cursor: pointer;
`;

export const Sidebar = styled.nav`
    grid-column: 1 / 2;
    grid-row: 2 / 3;
    background-color: ${props => getThemeColors(props.$isDarkMode).sidebarBg};
    border-right: 1px solid ${props => getThemeColors(props.$isDarkMode).border};
    transition: background-color 0.3s, border-color 0.3s;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 20px;
    gap: 25px;
`;

export const SidebarLink = styled.a`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50px;
    height: 50px;
    border-radius: 10px;
    cursor: pointer;
    padding: 5px; 
    
    img {
        width: 25px; 
        height: 25px;
    }
    
    background-color: transparent;
    
    ${props => props.$isActive && css`
        background-color: #e6eefe; 
        border: 1px solid #b3c5ff; 
    `}

    &:hover {
        background-color: ${props => props.$isDarkMode ? '#3a3a3a' : '#f0f0ff'};
        color: ${props => getThemeColors(props.$isDarkMode).primary};
    }
`;

export const ContentArea = styled.main`
    grid-column: 2 / 3;
    grid-row: 2 / 3;
    padding: 24px;
    overflow-y: auto; 
`;

export const DashboardContainer = styled.div`
    /* Estilos específicos para o container azul das tarefas, se for a seção ativa */
`;

export const SectionTask = styled.section`
    display: flex;
    align-items: center;
    gap: 16px;

    & h2 {
        font-family: "Geist", sans-serif;
        font-size: 2.5em;
        font-weight: 100;
        color: #28209bff;
    }
`;

export const TaskListContainer = styled.div`
    display: flex;
    flex-direction: row; 
    align-items: flex-start; 
    gap: 15px; 
    
    overflow-x: auto; 
    overflow-y: hidden;
    flex-wrap: nowrap;
    
    padding-left: 10px;
    padding-bottom: 20px; 
`;

export const KanbanHeader = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 20px; 
    
    h2 {
        margin-left: 20px;
        font-size: 24px;
        color: #333;
    }
`;

export const SprintList = styled.div`
    position: absolute;
    top: 100px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
    background-color: #f7f7f7;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    z-index: 50; 
`;

export const SprintItem = styled.div`
    padding: 8px 12px;
    background-color: #5a52d9;
    color: white;
    border-radius: 6px;
    font-size: 0.85em;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s, transform 0.1s;
    white-space: nowrap;

    &:hover {
        background-color: #4841b5;
        transform: translateY(-1px);
    }
`;  

export const PanelContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    height: 100%;
`;

export const ChartWrapper = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 800px;
    margin: 30px 0;
`;

export const ChartArea = styled.div`
    flex-grow: 1;
    height: 450px;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const ArrowButton = styled.button`
    background: none;
    border: none;
    font-size: 36px;
    color: #5a52d9;
    cursor: pointer;
    padding: 10px;
    transition: transform 0.2s, color 0.2s;
    user-select: none;
    
    &:hover {
        color: #4841b5;
        transform: scale(1.1);
    }
`;

export const BacklogContainer = styled.div`
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    height: 100%;
    overflow-y: auto; 
    
    h2 {
        color: #333;
        margin-bottom: 20px;
        border-bottom: 2px solid #ddd;
        padding-bottom: 10px;
    }
`;

export const TaskList = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 5px;
`;

export const TaskHeader = styled.div`
    display: grid;
    grid-template-columns: 0.5fr 2.5fr 1.5fr 1fr 1.5fr 1fr;
    background-color: #5a52d9;
    color: white;
    padding: 12px 15px;
    font-weight: bold;
    border-radius: 5px 5px 0 0;
    text-transform: uppercase;
    font-size: 0.85em;
    cursor: grab;
`;

export const TaskRow = styled.div`
    display: grid;
    grid-template-columns: 0.5fr 2.5fr 1.5fr 1fr 1.5fr 1fr;
    padding: 15px 15px;
    background-color: ${props => props.$isDragging ? '#e6f7ff' : 'white'};
    border-bottom: 1px solid #eee;
    align-items: center;
    font-size: 0.9em;
    cursor: grab;
    box-shadow: ${props => props.$isDragging ? '0 4px 10px rgba(0, 0, 0, 0.1)' : 'none'};

    &:last-child {
        border-bottom: none;
        border-radius: 0 0 5px 5px;
    }
    &:hover {
        background-color: #f0f0ff;
    }
`;

export const TaskName = styled.div`
    font-weight: 500;
    color: #333;
`;

export const TaskPriority = styled.div`
    padding: 4px 8px;
    border-radius: 4px;
    text-align: center;
    font-weight: bold;
    font-size: 0.8em;
    width: fit-content;

    background-color: ${props => {
        switch (props.priority) {
            case 'high': return '#FFDAD8';
            case 'medium': return '#FFF7AE';
            case 'low': return '#D9F7BE';
            default: return '#eee';
        }
    }};
    color: ${props => {
        switch (props.priority) {
            case 'high': return '#F5222D';
            case 'medium': return '#FAAD14';
            case 'low': return '#52C41A';
            default: return '#666';
        }
    }};
`;

export const ActionButton = styled.button`
    padding: 6px 10px;
    background-color: #5a52d9;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
    transition: background-color 0.2s;

    &:hover {
        background-color: #4841b5;
    }
`;

export const TaskSprintSelect = styled.select`
    padding: 6px 4px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #fff;
    font-size: 0.9em;
    cursor: pointer;
    width: 95%;
    transition: border-color 0.2s;

    &:hover {
        border-color: #5a52d9;
    }
`;

export const SettingsPanelContainer = styled.div`
    position: fixed;
    top: 0;
    right: 0;
    width: 300px;
    height: 100vh;
    background-color: ${props => getThemeColors(props.$isDarkMode).sidebarBg};
    box-shadow: -4px 0 10px ${props => props.$isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)'};
    z-index: 1000;
    transition: transform 0.3s ease-in-out;

    transform: translateX(${props => props.$isOpen ? '0' : '100%'});
    
    display: flex;
    flex-direction: column;

    h3 {
        color: ${props => getThemeColors(props.$isDarkMode).text};
        margin: 0;
    }
`;

export const SettingsHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #eee;
    background-color: #f7f9fc;
    
    h3 {
        color: #333;
        margin: 0;
    }
`;

export const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 30px;
    line-height: 1;
    cursor: pointer;
    color: #999;
    transition: color 0.2s;

    &:hover {
        color: #5a52d9;
    }
`;

export const ProfileInfo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;
    
    ${Avatar} {
        height: 80px;
        width: 80px;
        margin-bottom: 10px;
    }
    
    p {
        font-size: 0.9em;
        color: #666;
    }
`;

export const SettingsList = styled.div`
    flex-grow: 1;
    padding: 10px 0;
`;

export const SettingsItem = styled.div`
    padding: 15px 20px;
    cursor: pointer;
    color: ${props => getThemeColors(props.$isDarkMode).text};
    font-size: 1em;
    transition: background-color 0.2s;

    &:hover {
        background-color: ${props => props.$isDarkMode ? '#3a3a3a' : '#f0f0ff'};
        color: ${props => getThemeColors(props.$isDarkMode).primary};
    }
`;

// ==========================================================
// 3. ESTILOS DO TASK MODAL (Seu código, adaptado com tema e animação)
// ==========================================================

export const ModalOverlay = styled.div`
    position: fixed; 
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000; 
    
    background-color: rgba(0, 0, 0, 0.6); 
    backdrop-filter: blur(2px); /* Adicionado: Efeito de desfoque */
    
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const TaskModalContent = styled.div`
    position: fixed; /* Alterado de relative para fixed/absolute para usar a animação */
    top: 50%;
    left: 50%;
    
    padding: 30px;
    border-radius: 12px;
    width: 90%;
    max-width: 450px; 
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
    
    /* Adaptando para o tema */
    background-color: ${props => getThemeColors(props.$isDarkMode).contentBg};
    color: ${props => getThemeColors(props.$isDarkMode).text};
    
    z-index: 1001; 
    
    /* --- APLICAÇÃO DA ANIMAÇÃO --- */
    animation: ${fadeInScale} 0.3s ease-out forwards;
`;

export const ModalCloseButton = styled.button`
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: ${props => getThemeColors(props.$isDarkMode).textSecondary};
    transition: color 0.2s;

    &:hover {
        color: ${props => getThemeColors(props.$isDarkMode).primary};
    }
`;

export const ModalTitle = styled.h3`
    margin-top: 0;
    margin-bottom: 20px;
    color: ${props => getThemeColors(props.$isDarkMode).text};
    font-size: 24px;
`;

// ==========================================================
// 4. ESTILOS DO FORMULÁRIO E INPUTS DO MODAL
// ==========================================================

export const FormGroup = styled.div`
    margin-bottom: 15px;
`;

export const FormLabel = styled.label`
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    color: ${props => getThemeColors(props.$isDarkMode).textSecondary};
`;

const BaseInputStyle = css`
    width: 100%;
    padding: 10px;
    border: 1px solid ${props => getThemeColors(props.$isDarkMode).border};
    border-radius: 6px;
    box-sizing: border-box;
    transition: border-color 0.2s;
    background-color: ${props => getThemeColors(props.$isDarkMode).sidebarBg};
    color: ${props => getThemeColors(props.$isDarkMode).text};

    &:focus {
        border-color: ${props => getThemeColors(props.$isDarkMode).primary}; 
        outline: none;
    }
`;

export const FormInput = styled.input`
    ${BaseInputStyle}
`;

export const FormTextarea = styled.textarea`
    ${BaseInputStyle}
    resize: vertical; 
`;

export const SaveButton = styled.button`
    background-color: ${props => getThemeColors(props.$isDarkMode).primary}; 
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    width: 100%;
    margin-top: 15px;

    &:hover {
        background-color: ${props => getThemeColors(props.$isDarkMode).primary}d9; /* Um pouco mais escuro */
    }
`;

// ==========================================================
// 5. ESTILOS DE PRIORIDADE DO MODAL
// ==========================================================

export const PriorityOptions = styled.div`
    display: flex;
    gap: 10px; 
    margin-top: 5px;
`;

export const PriorityButton = styled.button`
    
    ${(props) => {
        const colors = getPriorityColors(props.$level);
        return css`
            background-color: ${colors.background};
            color: ${colors.text};
            border: 1px solid ${colors.border};
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            
            
            opacity: 0.6;

            
            &:hover {
                opacity: 0.8;
            }

            
            ${props.$isActive && css`
                opacity: 1; 
                box-shadow: 0 0 0 2px ${colors.text}; 
                transform: translateY(-1px);
            `}
        `;
    }}
`;


// Adicione este botão para estilizar o botão Deletar (melhor que estilo inline)
export const DeleteButton = styled.button`
    background-color: #ff4d4f; /* Vermelho padrão para deletar */
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: #e53e40; /* Vermelho mais escuro no hover */
    }
`;