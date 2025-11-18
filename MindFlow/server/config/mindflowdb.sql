-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 15/11/2025 às 11:26
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `mindflowdb`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `tarefas`
--

CREATE TABLE `tarefas` (
  `id` int(11) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `descricao` text DEFAULT NULL,
  `prioridade` enum('low','medium','high') DEFAULT 'medium',
  `data_vencimento` date DEFAULT NULL,
  `status` enum('to-do','in-progress','done') DEFAULT 'to-do',
  `sprint_id` int(11) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT 1,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `tarefas`
--

INSERT INTO `tarefas` (`id`, `titulo`, `descricao`, `prioridade`, `data_vencimento`, `status`, `sprint_id`, `usuario_id`, `criado_em`) VALUES
(1, 'Comprar Material', 'Papel e canetas para o projeto', 'medium', '2025-11-04', 'to-do', 1, 1, '2025-11-15 05:50:19'),
(2, 'Reunião com Cliente', 'Apresentar o protótipo V2', 'high', '2025-10-29', 'to-do', 1, 1, '2025-11-15 05:50:19'),
(3, 'Definir Estrutura de Rotas', 'Backlog para o próximo ciclo', 'low', '2025-11-19', 'to-do', NULL, 1, '2025-11-15 05:50:19'),
(6, 'Reunião Financeira', 'orçamento', 'medium', '2025-11-20', 'to-do', 1, 1, '2025-11-15 08:51:44');

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `senha` varchar(255) DEFAULT NULL,
  `avatar` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `usuario`
--

INSERT INTO `usuario` (`id`, `nome`, `email`, `senha`, `avatar`) VALUES
(2, 'maria Eduarda Sousa', 'mariaeduarda3945@gmail.com', '$2b$10$Me/mXi5sDzAvAjDwBOieze5.ib3G8LlWU23jiAjcGxVjd0BCCxJRy', '/uploads/1763194289017-85728146.png'),
(3, 'Alice Almeida', 'Alicealmeida@gmail.com', '$2b$10$B/6klkJb24EOT93Bgh0uceYCHrXBIyICH4E5TdWfnn7mOm1obi35S', NULL),
(4, 'Felipa', 'Felipa@gmail.com', '$2b$10$7gcqA0eyro6dX.MgmVRy1O9fcRAdneZhP9QmPTPqRLoCSvx8.IzNa', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `sprints` (CORRIGIDA E COMPATÍVEL)
--

CREATE TABLE `sprints` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,          -- Alterado de 'nome' para 'name'
  `start_date` date NOT NULL,            -- Alterado de 'data_inicio' para 'start_date'
  `end_date` date NOT NULL,              -- Alterado de 'data_fim' para 'end_date'
  `goal` text DEFAULT NULL,              -- Alterado de 'descricao' para 'goal'
  `color` varchar(20) DEFAULT '#3133B8', -- Adicionado 'color'
  `usuario_id` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `tarefas`
--
ALTER TABLE `tarefas`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `sprints`
--
ALTER TABLE `sprints`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `tarefas`
--
ALTER TABLE `tarefas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `sprints`
--
ALTER TABLE `sprints`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;