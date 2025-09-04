### Dia 1 (2h)

- Criar repositório GitHub e README inicial
- Criar projeto com Next.js (frontend e backend juntos)
- Instalar dependências iniciais (Sequelize, PostgreSQL, dotenv, etc.)

### Dia 2 (2h)

- Criar `.env` e configurar variáveis (banco, porta, JWT_SECRET)
- Configurar Sequelize (conexão e estrutura de pastas)
- Testar conexão com banco local (PostgreSQL)

### Dia 3 (2h)

- Criar primeiras migrations: `usuario`, `aluno`
- Rodar migrations e validar estrutura no banco
- Configurar scripts `dev` e `start`

### Dia 4 (2h)

- Criar rotas básicas e teste de API (`/ping`, `/api/test`)
- Refatorar organização do backend (pasta `controllers`, `models`, `routes`)

---

## 🧩 Semana 2 – 23 a 29 de Setembro (Autenticação e JWT)

### Dia 1 (2h)

- Criar controller de autenticação: `/login`, `/register`
- Criar hash e verificação de senha com **bcrypt**

### Dia 2 (2h)

- Gerar token JWT no login
- Criar middleware `auth` para proteger rotas privadas

### Dia 3 (2h)

- Criar middleware de verificação por perfil (`gestor`, `profissional`, etc.)
- Criar função de logout (opcional)

### Dia 4 (2h)

- Criar rota para recuperar senha (gerar token temporário)
- Documentar autenticação com exemplos (Postman)

---

## 🧩 Semana 3 – 30 Setembro a 6 Outubro (Usuários e Perfis)

### Dia 1 (2h)

- Criar model `usuario` com CRUD
- Implementar cadastro de usuários com perfil

### Dia 2 (2h)

- Listagem de usuários (apenas gestor pode ver todos)
- Detalhes e filtros básicos (por nome ou perfil)

### Dia 3 (2h)

- Atualização de dados (nome, perfil, status)
- Validação para evitar e-mails duplicados

### Dia 4 (2h)

- Criação da tela de login e cadastro com Material UI (básico)
- Testar login com redirecionamento conforme perfil

---

## 🧩 Semana 4 – 7 a 13 Outubro (Alunos)

### Dia 1 (2h)

- Criar model `aluno`
- Criar rota de cadastro e validações de campos obrigatórios

### Dia 2 (2h)

- Implementar listagem com filtros (nome, turma, turno)
- Criar relação com profissionais e atividades (referências)

### Dia 3 (2h)

- Tela de formulário de aluno (Material UI)
- Tela de listagem com filtros básicos

### Dia 4 (2h)

- Validação de duplicidade (nome + turma)
- Status ativo/inativo com inativação lógica

---

## 🧩 Semana 5 – 14 a 20 Outubro (Profissionais)

### Dia 1 (2h)

- Criar model `profissional`
- Criar controller e rotas para cadastrar e listar

### Dia 2 (2h)

- Criar tela de cadastro e listagem
- Filtro por setor ou nome

### Dia 3 (2h)

- Criar tabela `disponibilidade`
- Criar CRUD de horários por dia da semana

### Dia 4 (2h)

- Tela de interface para escolher horários disponíveis
- Validar horários sobrepostos

## Semana 6 – 21 a 27 Outubro (Atividades)

### Dia 1 (2h)

- Criar model `atividade` com tipo, cor, duração padrão
- Criar rota de cadastro e listagem

### Dia 2 (2h)

- Tela de cadastro com seleção de tipo e cor (Material UI)
- Tela de listagem com filtro por tipo

### Dia 3 (2h)

- Criar validação de status ativo/inativo
- Relacionar atividades aos agendamentos (prévia)

### Dia 4 (2h)

- Testar vínculos com alunos/profissionais
- Ajustes finos no CRUD e filtros

---

## 🧩 Semana 7 – 28 Outubro a 3 Novembro (Agendamentos)

### Dia 1 (2h)

- Criar model `agendamento` com relações entre aluno, profissional, atividade
- Criar rota para criar agendamento

### Dia 2 (2h)

- Validar conflitos de horário com base na disponibilidade
- Validação de sobreposição de horários

### Dia 3 (2h)

- Criar tela de criação de agendamento com calendário simples
- Permitir selecionar aluno, profissional e atividade

### Dia 4 (2h)

- Testes de lógica e validações no backend
- Refatoração do código para clareza e reuso

---

## 🧩 Semana 8 – 4 a 10 Novembro (Visualização de Agenda)

### Dia 1 (2h)

- Instalar e configurar **React Big Calendar** ou **FullCalendar**
- Criar componente visual de calendário semanal

### Dia 2 (2h)

- Visualizar agenda por aluno
- Mostrar nome do profissional e atividade na célula

### Dia 3 (2h)

- Visualizar agenda por profissional
- Mostrar nome do aluno e tipo de atividade

### Dia 4 (2h)

- Filtros por data, turno, tipo de atividade
- Validação de navegação entre semanas

---

## 🧩 Semana 9 – 11 a 17 Novembro (Mural de Avisos + Painel do Gestor)

### Dia 1 (2h)

- Criar model `mural_avisos` e rotas para criar e listar
- Filtro por setor e data de expiração

### Dia 2 (2h)

- Tela de publicação de aviso (Material UI)
- Tela de visualização por setor

### Dia 3 (2h)

- Início do **Painel do Gestor**: contagem de agendamentos, alunos ativos
- Listagem de profissionais com disponibilidade

### Dia 4 (2h)

- Criar logs simples de ações (rota e model `log_acao`)
- Listagem no painel administrativo

---

## 🧩 Semana 10 – 18 a 24 Novembro (Ajustes finais)

### Dia 1 (2h)

- Exportar agenda para PDF com **jsPDF**
- Botão "Gerar grade semanal por aluno"

### Dia 2 (2h)

- Verificação de acessos por perfil (bloqueios frontend)
- Proteção de rotas com base no JWT

### Dia 3 (2h)

- Revisar código, componentes e reutilização
- Criar tela de "Sobre" ou rodapé institucional

### Dia 4 (2h)

- Refatorar estrutura de pastas e comentários
- Documentar endpoints e regras no README
