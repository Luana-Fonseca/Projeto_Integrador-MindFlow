import React from 'react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts';
import { differenceInDays, addDays, format } from 'date-fns';

const BurndownChart = ({ data, sprints }) => {
    // 1. Encontrar a Sprint Ativa (vamos usar a primeira sprint como exemplo)
    const activeSprintId = Object.keys(sprints)[0];
    const activeSprint = sprints[activeSprintId];

    if (!activeSprint) {
        return <p style={{ color: '#aaa' }}>Nenhuma Sprint ativa para gerar o Burndown Chart.</p>;
    }

    // 2. Definir Datas e Trabalho Total (Vamos usar a contagem de tarefas como "Trabalho")
    const startDate = new Date(activeSprint.startDate);
    const endDate = new Date(activeSprint.endDate);
    
    // Total de dias da Sprint (incluindo início e fim)
    const totalDays = differenceInDays(endDate, startDate) + 1;

    // Total de tarefas (Backlog + Em Andamento + Finalizado) que pertencem à sprint
    const sprintTaskIds = Object.values(data.tasks)
        .filter(task => task.sprintId === activeSprintId)
        .map(task => task.id);
        
    const totalWork = sprintTaskIds.length;

    // 3. Gerar Dados para o Gráfico (Simulação)
    const chartData = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < totalDays; i++) {
        const date = addDays(startDate, i);
        const dateString = format(date, 'dd/MM');

        // LINHA IDEAL: Trabalho restante ideal para este dia
        const idealRemaining = totalWork - (totalWork / (totalDays - 1)) * i;
        const ideal = Math.max(0, idealRemaining); // Garante que não é negativo

        // LINHA REAL: Simulação do Trabalho Restante
        let real = totalWork;
        
        // Simulação de queima (para fins de visualização do Burndown)
        if (date <= today) {
            // Conta as tarefas finalizadas ATÉ ESTA DATA na simulação
            // Como não temos histórico, simulamos: assumimos que 50% das tarefas 
            // Finalizadas foram antes de hoje, e as 'A Fazer' e 'Em Andamento' ainda restam.
            
            const doneCount = Object.keys(data.columns['column-done'].taskIds)
                .filter(taskId => sprintTaskIds.includes(taskId)).length;
            
            const remainingCount = Object.keys(data.columns['column-to-do'].taskIds)
                .filter(taskId => sprintTaskIds.includes(taskId)).length + 
                Object.keys(data.columns['column-in-progress'].taskIds)
                .filter(taskId => sprintTaskIds.includes(taskId)).length;
            
            // Para a linha Real, só podemos usar dados atuais se a data for "Hoje" ou anterior.
            // Para as datas anteriores, usamos uma interpolação simplificada (simulação)
            
            if (i === 0) {
                 real = totalWork; // Começa com o total
            } else if (differenceInDays(date, today) === 0) {
                // Se for hoje, usamos o trabalho restante real (tasks não finalizadas)
                 real = remainingCount; 
            } else if (date < today) {
                // Se for passado, interpolamos entre o total e o restante atual
                const progressRatio = i / differenceInDays(today, startDate); // progresso até este dia
                real = totalWork - (totalWork - remainingCount) * progressRatio; // simula a queima
                real = Math.max(real, remainingCount); // Garante que a linha não desça demais
            } else {
                // Se for futuro, mantemos o restante atual (ou seja, a linha Real fica plana)
                real = remainingCount;
            }
        }
        
        chartData.push({
            name: dateString,
            Ideal: Math.ceil(ideal),
            Real: Math.ceil(real),
        });
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Trabalho Restante (Tarefas)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                
                {/* Linha Ideal - Reta, cor de guia */}
                <Line 
                    type="linear" 
                    dataKey="Ideal" 
                    stroke="#5a52d9" 
                    strokeDasharray="5 5" // Linha pontilhada
                    activeDot={{ r: 8 }}
                />
                
                {/* Linha Real - Progresso efetivo */}
                <Line 
                    type="monotone" 
                    dataKey="Real" 
                    stroke="#FF0000" // Vermelho para indicar o trabalho restante
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default BurndownChart;