import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

// Cores para as Prioridades
const PRIORITY_COLORS = {
    high: '#F5222D',   // Vermelho (Alta)
    medium: '#FAAD14', // Amarelo (Média)
    low: '#52C41A',    // Verde (Baixa)
};

const PriorityMatrixChart = ({ data }) => {
    // 1. Processar os dados para contagem de Prioridade por Coluna
    const processedData = data.columnOrder.map(columnId => {
        const column = data.columns[columnId];
        
        // Inicializa contadores
        const priorityCounts = {
            columnName: column.title,
            high: 0,
            medium: 0,
            low: 0,
        };

        // Conta as tarefas em cada coluna, agrupadas por prioridade
        column.taskIds.forEach(taskId => {
            const task = data.tasks[taskId];
            if (task && task.priority) {
                // Garante que o nome da propriedade bate com as chaves high/medium/low
                priorityCounts[task.priority] += 1;
            }
        });

        return priorityCounts;
    });

    // Filtra colunas que não têm tarefas para evitar barras vazias (Opcional)
    const filteredData = processedData.filter(col => col.high + col.medium + col.low > 0);

    if (filteredData.length === 0) {
        return <p style={{ color: '#aaa' }}>Nenhuma tarefa com prioridade definida para gerar a Matriz de Prioridade.</p>;
    }
    
    // 2. Componente de Renderização

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={filteredData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                
                {/* Eixo X: Nomes das Colunas (A Fazer, Em Andamento, Finalizado) */}
                <XAxis dataKey="columnName" />
                
                {/* Eixo Y: Contagem de Tarefas */}
                <YAxis allowDecimals={false} label={{ value: 'Nº de Tarefas', angle: -90, position: 'insideLeft' }} />
                
                <Tooltip 
                    formatter={(value, name) => [`${value} tarefas`, `Prioridade ${name}`]}
                    labelStyle={{ fontWeight: 'bold' }}
                />
                
                <Legend />
                
                {/* Barras Empilhadas (Stacked Bars) */}
                
                {/* Prioridade ALTA */}
                <Bar dataKey="high" stackId="a" fill={PRIORITY_COLORS.high} name="Alta" />
                
                {/* Prioridade MÉDIA */}
                <Bar dataKey="medium" stackId="a" fill={PRIORITY_COLORS.medium} name="Média" />
                
                {/* Prioridade BAIXA */}
                <Bar dataKey="low" stackId="a" fill={PRIORITY_COLORS.low} name="Baixa" />
                
            </BarChart>
        </ResponsiveContainer>
    );
};

export default PriorityMatrixChart;