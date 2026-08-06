# Sistema de Gestão para Academia - FitControl IA

Repositório destinado ao desenvolvimento do projeto prático da disciplina de Fundamentos de Inteligência Artificial (FIA). O objetivo deste primeiro incremento é registrar a definição inicial do problema, o escopo, o público-alvo, as fontes de dados e o planejamento ágil (backlog) de um sistema inteligente para gestão de academias.

---

## 1. Domínio Inicial Escolhido
**Gestão de Academias e Educação Física**, com foco no controle de alunos, planos de treino personalizados, gestão de acessos e utilização de algoritmos preditivos para engajamento e prevenção de evasão (*churn*).

---

## 2. Descrição do Problema
Gerenciar uma academia envolve o controle constante de mensalidades, frequência de alunos, renovações de planos, lotação de horários de pico e a montagem de fichas de treino individualizadas. Um dos maiores desafios dos gestores é a alta taxa de desistência (evasão de alunos) e a dificuldade dos instrutores em acompanhar de forma próxima a evolução de cada aluno para propor ajustes nos treinos. 

O projeto visa desenvolver um sistema que centralize a operação da academia e utilize técnicas de Inteligência Artificial para identificar padrões de abandono, prever a necessidade de renovação de planos e auxiliar na recomendação automatizada de variações de exercícios com base no perfil e objetivo do aluno.

---

## 3. Público ou Contexto de Aplicação
* **Gestores e Administradores de Academias:** Que precisam otimizar o fluxo financeiro, controlar o acesso à catraca e monitorar a retenção de clientes.
* **Professores e Personal Trainers:** Que buscam agilidade na criação e acompanhamento de rotinas de treino adaptadas às limitações e objetivos dos praticantes.
* **Alunos da Academia:** Que utilizam a plataforma para consultar seus treinos, histórico de frequência e evolução de cargas.
* **Contexto de Aplicação:** Aplicável a academias de médio porte, estúdios de musculação, CrossFit ou centros de treinamento funcional.

---

## 4. Justificativa: Por que este problema pode ser tratado com IA?
O problema é ideal para a aplicação de IA devido aos seguintes fatores:
* **Análise Preditiva de Evasão (*Churn Prediction*):** Algoritmos de Machine Learning (como árvores de decisão ou regressão logística) podem analisar o histórico de frequência, dias da semana que o aluno frequenta e tempo de plano para prever quais clientes possuem alto risco de cancelar a matrícula, permitindo ações proativas da recepção.
* **Sistemas de Recomendação:** Uso de lógica baseada em regras ou aprendizado de máquina para sugerir progressão de carga ou exercícios substitutos com base no histórico de desempenho e restrições físicas do aluno.
* **Agrupamento (*Clustering*):** Segmentação de alunos por objetivos e comportamento de treino para campanhas de marketing direcionadas ou programas de incentivo.

---




## 5. Registro de Possíveis Fontes de Dados
Para alimentar e testar o sistema, serão utilizadas as seguintes fontes de dados (dados simulados ou anonimizados para conformidade com a LGPD):
1. **Base de Dados Relacional Própria (MySQL):** Tabelas estruturadas contendo cadastros de clientes, planos ativos, registros de acesso à catraca (logs de frequência) e histórico de pagamentos.
2. **Dados de Treinamento e Exercícios:** Repositório interno com catálogo de exercícios, grupos musculares, equipamentos necessários e níveis de dificuldade.
3. **Métricas de Desempenho:** Registros simulados de avaliações físicas (peso, percentual de gordura, circunferências) e cargas utilizadas nos aparelhos ao longo do tempo.

---

## 6. Primeira Versão do Backlog do Projeto (Product Backlog)

| ID | Épico / Funcionalidade | Descrição Resumida | Prioridade |
| :--- | :--- | :--- | :--- |
| **US01** | Configuração do Ambiente | Estruturação inicial do repositório Git, configuração do README e definição da arquitetura base. | Alta |
| **US02** | Gestão de Alunos e Planos | CRUD de clientes, controle de matrículas, tipos de planos e status de pagamento. | Alta |
| **US03** | Controle de Acessos e Frequência | Registro de check-in / entrada na academia e monitoramento de dias ausentes. | Alta |
| **US04** | Módulo de Treinos | Cadastro de exercícios, montagem de fichas de treino personalizadas por professor e visualização pelo aluno. | Média |
| **US05** | Módulo de IA Preditiva (Churn) | Implementação de modelo preditivo para identificar alunos com risco de evasão com base na queda de frequência. | Baixa / Futura |

---

## 7. Declaração de Uso de IA Generativa
Declara-se que ferramentas de Inteligência Artificial Generativa foram utilizadas como suporte de apoio e estruturação de texto para a formulação deste documento de escopo, revisão conceitual da aplicabilidade de IA no domínio de gestão de academias e formatação do backlog inicial, sob supervisão e validação direta do autor do projeto.
