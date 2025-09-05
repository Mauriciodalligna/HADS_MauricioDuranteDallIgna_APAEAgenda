📅 Cronograma atualizado (desenvolvimento iterativo por feature)
🧩 Semana 1 – Setup inicial

Dia 1 (2h)

Criar repositório GitHub e README inicial

Criar projeto com Next.js (frontend + API juntos)

Instalar dependências iniciais (Sequelize, PostgreSQL, bcrypt, JWT, dotenv, etc.)

Dia 2 (2h)

Criar .env e configurar variáveis (banco, porta, JWT_SECRET)

Configurar Sequelize (conexão e estrutura de pastas)

Testar conexão com banco local (PostgreSQL)

Dia 3 (2h)

Criar migrations iniciais: usuario

Criar model usuario e rodar migration

Validar tabela criada no banco

Dia 4 (2h)

Criar rota básica /api/ping

Configurar pastas (controllers, routes, models)

Testar rota com Postman

🧩 Semana 2 – Autenticação + Tela de Login

Dia 1 (2h)

Criar controller de autenticação: /api/auth/login e /api/auth/register

Implementar hash e verificação de senha com bcrypt

Testar login e cadastro no Postman

Dia 2 (2h)

Gerar token JWT no login

Criar middleware auth para rotas privadas

Testar no Postman rota protegida /api/auth/profile

Dia 3 (2h)

Middleware de RBAC (roles: gestor, profissional, secretaria)

Validar acessos no Postman

Dia 4 (2h)

Criar tela de Login (Material UI)

Conectar com API /login e redirecionar por perfil

🧩 Semana 3 – Usuários (Gestão de Perfis)

Dia 1 (2h)

Migration + model usuario (completo: nome, email, senha, perfil, status)

CRUD no backend (/api/usuarios)

Testar via Postman

Dia 2 (2h)

Criar tela de cadastro de usuários (Material UI)

Validar cadastro com API

Dia 3 (2h)

Criar tela de listagem de usuários (somente gestor vê todos)

Testar filtros (nome, perfil)

Dia 4 (2h)

Implementar atualização e exclusão lógica (status ativo/inativo)

Testar no Postman + UI integrada

🧩 Semana 4 – Alunos

Dia 1 (2h)

Migration + model aluno

CRUD /api/alunos no backend

Testar via Postman

Dia 2 (2h)

Tela de cadastro de aluno (Material UI)

Validações básicas de formulário

Dia 3 (2h)

Tela de listagem de alunos com filtros (nome, turma, turno)

Conectar com API

Dia 4 (2h)

Validação de duplicidade (nome + turma)

Testar via Postman + UI

🧩 Semana 5 – Profissionais + Disponibilidade

Dia 1 (2h)

Migration + model profissional

CRUD backend /api/profissionais

Testar via Postman

Dia 2 (2h)

Tela de cadastro de profissional

Tela de listagem com filtros (nome, setor)

Dia 3 (2h)

Migration + model disponibilidade

CRUD de horários de disponibilidade

Testar via Postman

Dia 4 (2h)

Tela de interface para cadastrar horários disponíveis

Validação anti-sobreposição

🧩 Semana 6 – Atividades

Dia 1 (2h)

Migration + model atividade

CRUD /api/atividades

Testar via Postman

Dia 2 (2h)

Tela de cadastro de atividade (tipo, cor, duração)

Tela de listagem com filtros

Dia 3 (2h)

Validar status ativo/inativo

Relacionar atividades aos agendamentos (prévia)

Dia 4 (2h)

Testar vínculos com alunos e profissionais

Ajustes finos no CRUD

🧩 Semana 7 – Agendamentos

Dia 1 (2h)

Migration + model agendamento

Criar rota /api/agendamentos (POST, GET)

Testar via Postman

Dia 2 (2h)

Validação de disponibilidade do profissional

Anti-sobreposição de horários (Postman tests)

Dia 3 (2h)

Tela de criação de agendamento com calendário simples

Seleção de aluno, profissional e atividade

Dia 4 (2h)

Testes completos no backend

Ajustes de lógica no front

🧩 Semana 8 – Agenda Semanal

Dia 1 (2h)

Instalar React Big Calendar / FullCalendar

Criar calendário semanal

Dia 2 (2h)

Visualizar agenda por aluno

Mostrar profissional e atividade na célula

Dia 3 (2h)

Visualizar agenda por profissional

Mostrar aluno e atividade

Dia 4 (2h)

Filtros por data, turno, tipo de atividade

Testar UI integrada com API

🧩 Semana 9 – Mural de Avisos + Painel Gestor

Dia 1 (2h)

Migration + model mural_avisos

CRUD backend /api/mural

Testar no Postman

Dia 2 (2h)

Tela de publicação de aviso (Material UI)

Tela de listagem por setor

Dia 3 (2h)

Painel do Gestor: contagem de agendamentos, alunos ativos

Listagem de profissionais com disponibilidade

Dia 4 (2h)

Criar logs simples (log_acao) no backend

Tela de visualização no painel

🧩 Semana 10 – Ajustes Finais

Dia 1 (2h)

Exportar agenda para PDF (jsPDF)

Botão “Gerar grade semanal por aluno”

Dia 2 (2h)

Proteção de rotas frontend com JWT e RBAC

Testar acessos no Postman e no navegador

Dia 3 (2h)

Revisão de código, padronização de UI

Criar tela de “Sobre”

Dia 4 (2h)

Documentar endpoints no README

Checklist final de LGPD, segurança e responsividade
