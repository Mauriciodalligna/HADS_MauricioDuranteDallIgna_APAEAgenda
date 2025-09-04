Universidade de Passo Fundo – UPF

DOCUMENTO DE VISÃO DO PRODUTO - DVP

Agosto/2025
Mauricio Durante Dall Igna
Histórico de alterações do documento
Versão
Alteração efetuada
Responsável
Data
1.0
Documento Inicial do projeto
Mauricio
06/08/25
2.0
Continuação do projeto até 1.2
Mauricio
11/08/25
3.0
Continuação do Projeto até 1.3
Mauricio
18/08/25
4.0
Continuação do projeto até 1.4
Mauricio
25/08/25
5.0
continuação do projeto até 1.4 parte 2
Mauricio
01/09/25
6.0
Continuação do projeto até 2.0
Mauricio
08/09/25
7.0
Continuação do projeto até 3.0
Mauricio
08/09/25

Sumário

1. REQUISITOS 3
   1.1. Fundamentação dos Requisitos 3
   1.1.1. Técnicas Utilizadas para Requisitos 3
   1.2. Concepção dos Requisitos 3
   1.2.1. Identificação do Domínio 3
   1.2.2. Principais Stakeholders 3
   1.3. Elicitação dos Requisitos 3
   1.3.1. Requisitos Funcionais (RF) 3
   1.3.1.1. RF01 Gerenciar Login 3
   1.3.2. Requisitos Não-Funcionais (RNF) 4
   1.4. Especificação dos Requisitos 4
   1.4.1. UML – Diagrama de Casos de Uso 4
   1.4.2. Histórias de Usuário Por Caso de Uso 5
   1.4.2.1. UC01 Gerenciar Login 5
   1.5. Projeto Técnico 6
   1.5.1. Tecnologias e Ferramentas 6
   1.5.2. Modelo Lógico do Banco de Dados 6

REQUISITOS
Fundamentação dos Requisitos
Técnicas Utilizadas para Requisitos
Entrevistas e alinhamento com o solicitante;
Análise de documentação e planilha atual (Google Docs/Planilhas) usada para agendamentos;
Consolidação dos dados em visão de domínio e regras de negócios.
Sistemas similares.

Concepção dos Requisitos
Identificação do Domínio
O domínio deste sistema é a Gestão de Agendamentos Educacionais e Terapêuticos para a APAE de Marau. O sistema se propõe a organizar os agendamentos de alunos com necessidades educacionais e terapêuticas, englobando atividades como aulas e atendimentos terapêuticos, com o objetivo de otimizar a alocação de horários e evitar conflitos. Ele visa garantir que os alunos recebam os atendimentos necessários de maneira eficiente, sem sobreposição de horários, permitindo que os profissionais possam acessar as informações de forma clara e acessível.
O objetivo principal do sistema dentro desse domínio é otimizar o processo de agendamento, evitando conflitos de horários e aumentando a produtividade da equipe. A solução busca facilitar o planejamento e o controle de agendas de alunos e profissionais, proporcionando uma visão centralizada e detalhada das atividades, sem a necessidade de soluções manuais ou de planilhas.
O escopo do sistema inclui o cadastro de alunos e profissionais, a organização da agenda de atividades terapêuticas e educacionais, a comunicação interna por meio de um mural de avisos e notificações, e a geração de relatórios com a exportação das agendas para PDF. No entanto, o sistema não abrange o prontuário eletrônico dos alunos, a integração com outros sistemas externos, como de faturamento, ou a gestão de transporte.
Entre os termos importantes dentro do domínio estão:
Aluno: Refere-se aos indivíduos matriculados na APAE, que participam de atividades educacionais e terapêuticas.
Profissional: Designação para educadores, terapeutas e outros colaboradores que realizam atendimentos aos alunos.
Agenda: O conjunto de horários disponíveis para os atendimentos e aulas, associando profissionais e alunos a atividades específicas.
Atividade: Refere-se ao tipo de atendimento ou aula, como psicologia, fonoaudiologia, musicoterapia, entre outros.
Agendamento: Um registro de horário específico para um aluno ser atendido por um profissional para uma atividade definida.
Os principais stakeholders do sistema são:
Gestores e Coordenadores: Responsáveis pela configuração e manutenção do sistema.
Professores e Terapeutas: Usuários do sistema que consultam e organizam suas agendas de trabalho.
Secretaria: Responsável pela administração do cadastro de alunos, pela geração de relatórios e pelo suporte administrativo.
TI: Responsável pela infraestrutura técnica do sistema, incluindo o suporte e a manutenção.
No que diz respeito ao ambiente regulatório, o sistema deve estar em conformidade com a Lei Geral de Proteção de Dados (LGPD), garantindo a segurança e a privacidade das informações pessoais e sensíveis dos alunos e profissionais.
Atualmente, o processo de agendamento na APAE de Marau é realizado manualmente, utilizando planilhas do Google. Este modelo apresenta diversos desafios, como o risco de sobreposição de horários, falta de visibilidade sobre as agendas dos colegas de trabalho e a dificuldade de acesso remoto. O novo sistema visa resolver esses problemas, oferecendo uma plataforma centralizada, eficiente e acessível para todos os envolvidos, reduzindo erros e melhorando o fluxo de trabalho.

Principais Stakeholders
STAKEHOLDER
Stakeholder
Responsabilidade
Contato
Direção
Patrocínio, priorização estratégica
54 555555555
Coordenação/Gestores
Configuração do sistema, cadastro mestre, criação/edição de agendas
54 555555555
Professores
Consulta de agendas por turma/profissional, leitura do mural
54 555555555
Profissionais de Saúde/Terapias
Consulta de agendas próprias e de outros profissionais, leitura do mural
54 555555555
Secretaria
Consulta, emissão de PDFs, apoio aos gestores
54 555555555
TI/Manutenção
Suporte técnico, backups, gestão de acessos
54 555555555

Elicitação dos Requisitos
Requisitos Funcionais (RF)
RF01 Gerenciar Autenticação e Perfis
Importância:
[ X ] essencial [ ] importante [ ] desejável
Priorização:
[ X ] 1 [ ] 2 [ ] 3 [ ] 4 [ ] 5
Dependência com outro(s) requisito(s):

Problema /Necessidades Identificadas:
O sistema precisa garantir que apenas usuários autorizados (gestores, profissionais e secretaria) possam acessar a plataforma, mantendo a segurança dos dados e a privacidade dos alunos e profissionais.

Fluxos esperados:
O usuário acessa a página de login e informa suas credenciais (e-mail e senha).
Se as credenciais forem válidas, o sistema redireciona o usuário para a página principal da aplicação.
Se as credenciais forem inválidas, o sistema exibe uma mensagem de erro.
O usuário pode recuperar a senha informando seu e-mail e seguindo o fluxo de recuperação de senha.

RF02 Gerenciar Alunos
Importância:
[ X ] essencial [ ] importante [ ] desejável
Priorização:
[ X ] 1 [ ] 2 [ ] 3 [ ] 4 [ ] 5
Dependência com outro(s) requisito(s):

Problema /Necessidades Identificadas:
A APAE precisa de uma maneira eficiente de registrar e atualizar as informações dos alunos, incluindo dados pessoais, responsáveis e necessidades específicas de cada aluno. Atualmente, o processo de cadastro é manual e utiliza planilhas, o que torna o gerenciamento ineficaz e sujeito a erros.

Fluxos esperados:
O gestor acessa a seção de cadastro de alunos e insere os dados obrigatórios: nome, data de nascimento, turma, turno, escola, série, município, nome do responsável legal, telefone do responsável e observações.
O sistema valida os campos obrigatórios e a formatação dos dados (ex.: telefone).
O cadastro é salvo no banco de dados e pode ser editado posteriormente.
O aluno aparece na lista de alunos cadastrados e pode ser associado a agendamentos.

RF03 Gerenciar Profissionais
Importância:
[ X ] essencial [ ] importante [ ] desejável
Priorização:
[ X ] 1 [ ] 2 [ ] 3 [ ] 4 [ ] 5
Dependência com outro(s) requisito(s):

Problema /Necessidades Identificadas:
A APAE precisa de um sistema para registrar e gerenciar os profissionais que atendem os alunos. Isso inclui terapeutas, educadores e outros colaboradores. A falta de um controle eficaz sobre a disponibilidade de cada profissional causa sobrecarga e falta de organização nos agendamentos.

Fluxos esperados:
O gestor acessa a seção de cadastro de profissionais e insere dados como nome, setor, especialidade e disponibilidade semanal.
O sistema valida os campos obrigatórios e a disponibilidade do profissional.
O profissional é salvo no banco de dados e pode ser associado a agendamentos.

RF04 Gerenciar Atividades
Importância:
[ X ] essencial [ ] importante [ ] desejável
Priorização:
[ X ] 1 [ ] 2 [ ] 3 [ ] 4 [ ] 5
Dependência com outro(s) requisito(s):

Problema /Necessidades Identificadas:
É necessário que o sistema permita que o gestor crie atividades de maneira flexível, sem restrições de tipos predefinidos. Cada atividade pode ter duração e horário padrão, mas deve ser possível ajustar conforme a necessidade.

Fluxos esperados:
O gestor acessa a seção de atividades e insere o nome, tipo e duração padrão da atividade.
O sistema valida os campos obrigatórios.
A atividade é salva no banco de dados e pode ser associada a um agendamento futuro.

RF05 Agenda Semanal por Aluno e por Profissional
Importância:
[ X ] essencial [ ] importante [ ] desejável
Priorização:
[ X ] 1 [ ] 2 [ ] 3 [ ] 4 [ ] 5
Dependência com outro(s) requisito(s):

Problema /Necessidades Identificadas:
Atualmente, as agendas são geridas manualmente, o que dificulta o planejamento de atividades e o acompanhamento das interações entre alunos e profissionais. É fundamental centralizar as agendas em uma visualização clara e de fácil consulta.

Fluxos esperados:
O sistema exibe a grade semanal de atividades, com visão separada para cada aluno e cada profissional.
O gestor pode visualizar a agenda por turma ou por profissional.
O sistema bloqueia automaticamente horários em que já existe um agendamento para o aluno ou profissional.

RF06 Gerenciar Agendamentos
Importância:
[ X ] essencial [ ] importante [ ] desejável
Priorização:
[ X ] 1 [ ] 2 [ ] 3 [ ] 4 [ ] 5
Dependência com outro(s) requisito(s):
RF03, RF04, RF05
Problema /Necessidades Identificadas:
O sistema precisa permitir a criação de agendamentos de maneira eficiente, associando os alunos, profissionais e atividades corretas. A falta de um controle automatizado de conflitos de horários tem sido um problema recorrente.

Fluxos esperados:
O gestor seleciona o aluno, profissional, atividade, data e hora para o agendamento.
O sistema verifica se o horário do aluno e do profissional está disponível.
Se houver conflito de horários, o sistema avisa o gestor e impede a criação do agendamento.
Se o agendamento for válido, ele é salvo no banco de dados.

RF07 Consulta e Filtros de Agenda
Importância:
[ ] essencial [ X ] importante [ ] desejável
Priorização:
[ ] 1 [ X ] 2 [ ] 3 [ ] 4 [ ] 5
Dependência com outro(s) requisito(s):
RF05
Problema /Necessidades Identificadas:
Professores, profissionais de saúde e secretarias precisam consultar facilmente a agenda de alunos e de outros profissionais, com filtros por turma, atividade e data.

Fluxos esperados:
O usuário seleciona os filtros desejados (turma, profissional, atividade, intervalo de datas).
O sistema exibe a agenda com base nos filtros aplicados.
O usuário pode visualizar a agenda de forma clara, sem a possibilidade de edição.

RF08 Mural de Avisos
Importância:
[ ] essencial [ X ] importante [ ] desejável
Priorização:
[ ] 1 [ X ] 2 [ ] 3 [ ] 4 [ ] 5
Dependência com outro(s) requisito(s):

Problema /Necessidades Identificadas:
A comunicação interna entre os setores da APAE é feita de forma fragmentada, o que dificulta o fluxo de informações. Um mural de avisos centralizado pode ajudar a melhorar essa comunicação.

Fluxos esperados:
O usuário publica um aviso no mural com texto e, se necessário, anexos.
O sistema salva a mensagem e a torna visível para todos os setores.
O sistema salva a mensagem e a torna visível para todos os setores.

RF09 Administração do Sistema
Importância:
[ X ] essencial [ ] importante [ ] desejável
Priorização:
[ X ] 1 [ ] 2 [ ] 3 [ ] 4 [ ] 5
Dependência com outro(s) requisito(s):

Problema /Necessidades Identificadas:
A gestão centralizada das funcionalidades do sistema precisa ser feita de forma eficiente, sem sobrecarga para os gestores. Atualmente, as funções de cadastro, edição e gerenciamento são realizadas separadamente, o que aumenta a chance de erros e torna o processo ineficiente. Há também a necessidade de configurar a disponibilidade dos profissionais e realizar o acompanhamento de logs para garantir que todas as ações sejam devidamente registradas e auditáveis.
Fluxos esperados:
O gestor acessa o painel de administração.
O painel oferece opções de gerenciamento de Alunos, Profissionais e Atividades.
O painel de administração permite a configuração de disponibilidade dos profissionais, incluindo a definição de horários disponíveis e bloqueios para cada dia da semana.
O gerenciamento de agendas é realizado de forma centralizada, onde o gestor pode visualizar, adicionar, editar ou remover agendamentos, evitando conflitos de horários.
O sistema registra todas as ações realizadas no painel de administração, permitindo a visualização de logs básicos (quem fez a alteração, quando foi realizada e qual foi a ação).

         Requisitos Não-Funcionais (RNF)

Identificação
Descrição
RNF01
As interfaces de usuário no formato Web devem apresentar comportamento responsivo.
RNF02
Compatível com navegadores modernos (Chrome/Firefox/Edge atuais).
RNF03
Dados persistidos em SGBD consolidado (PostgreSQL).
RNF04
Autenticação via Firebase Authentication; acesso somente autenticado.
RNF04
Criptografia de dados sensíveis em repouso (no banco/armazenamento) e em trânsito (HTTPS).
RNF06
Desempenho: carregamento de páginas principais ≤ 2,5s em rede padrão corporativa;
RNF07
Escalabilidade horizontal leve (meta: suportar > 500 alunos e centenas de profissionais/eventos semanais).
RNF08
Instância única (APAE Marau)
RNF09
LGPD: minimização, base legal, controle de acesso, logs de acesso, anonimização/eliminação mediante solicitação (processo manual no MVP).

Especificação dos Requisitos

UML – Diagrama de Casos de Uso
O UC apresentado abaixo apresenta todos casos de usos definidos para solução.

Histórias de Usuário Por Caso de Uso
UC01 Autenticar Usuário

Objetivo:
Garantir que apenas usuários autenticados possam acessar as funcionalidades do sistema.

Regras de Negócio:
Login válido exige e-mail/usuário existente e senha correta.
Contas podem estar ativas ou inativas; contas inativas não autenticam.
Senhas devem ter no mínimo 8 caracteres e ser armazenadas com criptografia.
Recuperação de senha é feita via link único com validade (ex.: 30 min).
Após 5 tentativas inválidas consecutivas, bloquear o login por 15 min.
Primeiro acesso de usuário cadastrado pela administração requer definição de senha.

HISTÓRIAS DE USUÁRIOS

História:
HU01 – Logar na aplicação

Descrição:
COMO usuário, QUERO informar minhas credenciais PARA acessar o APAEAgenda com sucesso.
Regras de Negócio:
Validar usuário e senha.
Impedir acesso de conta inativa.
Aplicar bloqueio por tentativas.
Critérios de Aceite:
Dado usuário válido e senha correta, então direcionar ao Dashboard do seu perfil.
Dado usuário inexistente, então exibir mensagem “Usuário não cadastrado
Dado senha incorreta, então exibir mensagem “Senha inválida” e registrar tentativa.
Dado 5 falhas seguidas, então bloquear e informar o tempo restante para novo acesso.

História:
HU02 – Recuperar senha

Descrição:
COMO usuário que esqueci a senha, QUERO solicitar um link de recuperação PARA redefinir minha senha com segurança.

Regras de Negócio:

Enviar link único com validade.
Não revelar se o e-mail existe; sempre exibir mensagem neutra (“Se existir, enviaremos o link”).
Limitar a 3 solicitações por hora por e-mail.
Critérios de Aceite:
Ao informar e-mail, exibir confirmação neutra e (se existir) enviar link.
Link expirado não permite redefinição e orienta a solicitar novo.
Todos os acessos via link são auditados.

História:
HU03 – Cadastrar-se

Descrição:
COMO profissional que ainda não tem acesso, QUERO solicitar cadastro informando meus dados PARA que a coordenação aprove e eu possa acessar o sistema.

Regras de Negócio:
Campos mínimos: nome completo, e-mail institucional (ou validado), setor, especialidade, CPF, data de nascimento.

Critérios de Aceite:
Profissional consegue realizar Login

História:
HU04 – Exibir Menu por Perfil

Descrição:
COMO usuário autenticado, QUERO ver um menu com permissões do meu papel (Gestor/Profissional) PARA acessar apenas o que me é devido.

Regras de Negócio:
Perfis: Gestor (admin), Profissional (clínico/pedagógico).
Menu é montado por claims/roles do usuário.
Critérios de Aceite:
Gestor vê: Alunos, Profissionais, Agenda (CRUD), Mural, Relatórios (quando houver).
Profissional vê: Minha Agenda, Mural, Meu Perfil.
Acesso direto a rotas sem permissão retorna 403.

História:
HU05 – Controlar Acesso por Perfil

Descrição:
COMO usuário autenticado, QUERO que as opções de menu e funcionalidades visíveis estejam de acordo com meu perfil (Gestor ou Profissional) PARA que eu acesse apenas as funções permitidas.
Regras de Negócio:
O sistema exibe apenas as funcionalidades permitidas conforme o tipo de perfil.
Perfis possíveis: Gestor, Profissional, Secretaria.
O menu e as rotas são controlados no frontend com base na role do usuário (vinda do token JWT).
Requisições no backend são validadas também via autorização (ex: claims do JWT).
Critérios de Aceite:
Gestores veem opções completas de administração, agenda geral e cadastro.
Profissionais veem apenas “Minha Agenda”, mural e seu perfil.
Qualquer tentativa de acessar rota sem permissão retorna erro 403 (não autorizado).

UC02 Gerenciar Alunos
Objetivo:
Permitir ao Gestor cadastrar, atualizar, listar, inativar e vincular alunos às atividades e profissionais, com todas as informações relevantes para a gestão terapêutica e educacional, como dados pessoais, escola regular, município e responsáveis.

Regras de Negócio:
.Cada aluno possui: nome completo, idade, turma, turno, escola regular (além da APAE), série, cidade onde mora, nome do responsável e telefone de contato, além de status (ativo/inativo) e observações.
Um aluno pode ter múltiplos profissionais e atividades.
Alunos inativos não podem receber novos agendamentos, mas mantém seu histórico.
O Cadastro exige validação de duplicidade por nome + turma.
O sistema deve permitir pesquisa e filtro por nome, turma, turno ou município.
Alterações em dados principais devem ser registradas em log/histórico

HISTÓRIAS DE USUÁRIOS

História:
HU01 – Cadastrar Aluno

Descrição:
COMO Gestor, QUERO cadastrar um aluno informando seus dados pessoais e educacionais PARA incluí-lo no sistema de agendamento.
Regras de Negócio:
Campos obrigatórios: nome, idade, cidade, escola regular, série, turma, turno, responsável, telefone e status (ativo por padrão).
Critérios de Aceite:
Campos obrigatórios validados; sucesso cria registro ativo.

História:
HU02 – Editar Aluno

Descrição:
COMO Gestor, QUERO atualizar dados do aluno PARA manter o cadastro correto.

Regras de Negócio:
Alterações em dados-chave devem ser registradas em histórico. .
Mudanças refletem imediatamente nas agendas futuras.

Critérios de Aceite:
Alterações salvas e refletidas nas agendas.
Histórico mantém rastreabilidade das mudanças.

História:
HU03 – Inativar/reativar Aluno

Descrição:
COMO Gestor, QUERO inativar/reativar aluno PARA controlar participação nas agendas.

Regras de Negócio:
Alunos inativos não podem receber novos agendamentos, mas mantêm históricos.
Reativação permite novos agendamentos sem perda de dados.
Critérios de Aceite:
Status alterado para inativo → bloqueio de novos agendamentos.
Status reativado → agendamentos permitidos novamente.

História:
HU04 – Vincular Profissionais/Atividades ao Aluno

Descrição:
COMO Gestor, QUERO vincular profissionais e atividades ao aluno PARA organizar sua rotina.

Regras de Negócio:
Aluno pode ter múltiplos profissionais e atividades.
Apenas vínculos com entidades ativas são permitidos.
Alterações respeitam regras de agendamento (UC04).

Critérios de Aceite:
Vínculos salvos corretamente.
Restrições impedem associação inválida.

História:
HU05 – Listar/Pesquisar alunos

Descrição:
COMO Gestor, QUERO pesquisar por nome/turma/turno PARA localizar rapidamente um aluno.

Regras de Negócio:
Permitir filtros combinados.
Listagem paginada para melhor desempenho.

Critérios de Aceite:
Pesquisa retorna apenas registros que atendem aos filtros.
Paginação funcional.

UC03 Gerenciar Profissionais
Objetivo:
Permitir ao Gestor cadastrar, atualizar, listar e inativar profissionais e suas especialidades/setores.

Regras de Negócio:
Cada profissional deve possuir: nome completo, setor de atuação (ex: saúde,
pedagógico), especialidade (ex: fonoaudiólogo, psicopedagogo), e status (ativo/inativo).
É obrigatório informar a disponibilidade semanal do profissional no momento do cadastro.
Um profissional pode ser vinculado a múltiplas atividades.
Profissionais inativos não podem ser incluídos em novos agendamentos, mas mantêm o histórico.
A edição de dados como setor ou especialidade impacta a visualização de agenda e relatórios futuros.
O sistema deve permitir busca e filtros por nome, setor e especialidade.
Não deve ser permitido cadastrar dois profissionais com o mesmo nome + setor.
A exclusão de profissionais não é permitida, apenas inativação.
HISTÓRIAS DE USUÁRIOS

História:
HU01 – Cadastrar Prodissional

Descrição:
COMO Gestor, QUERO cadastrar um profissional PARA incluí-lo nas agendas.

Regras de Negócio:
Campos obrigatórios: nome, setor, especialidade, status (ativo por padrão).
Validar duplicidade de nome + setor.
Critérios de Aceite:
Preenchimento completo obrigatório.
Cadastro duplicado bloqueado com mensagem.

História:
HU02 – Editar Profissional

Descrição:
COMO Gestor, QUERO atualizar dados do profissional PARA manter o cadastro correto.

Regras de Negócio:
Alterações em setor/especialidade afetam agendas futuras.
Alterações registradas em histórico.

Critérios de Aceite:
Alterações refletidas nas agendas.
Histórico atualizado.

História:
HU03 – Inativar/reativar profissional.

Descrição:
COMO Gestor, QUERO inativar/reativar profissional PARA controlar sua alocação.

Regras de Negócio:
Profissionais inativos não recebem novos agendamentos, mas mantêm históricos.
Reativação restaura a possibilidade de novos agendamentos.

Critérios de Aceite:
Status alterado corretamente.
Bloqueio ou liberação imediata de agendamentos.

História:
HU04 – Listar/Pesquisar Profissionais

Descrição:
COMO Gestor, QUERO filtrar profissionais por nome/setor/especialidade PARA localizar rapidamente.

Regras de Negócio:
Permitir filtros combinados.
Lista paginada.
Critérios de Aceite:
Pesquisa retorna resultados consistentes.
Paginação funcional.

UC04 Gerenciar Agenda

Objetivo:
Criar, editar, mover, cancelar e visualizar agendamentos por aluno e por profissional em grade semanal, permitindo que o profissional saiba para onde o aluno irá após o seu atendimento.
Regras de Negócio:
Todo agendamento deve conter: aluno, profissional, atividade, data, hora de início e hora de fim.
Não é permitido criar agendamentos que causem sobreposição de horários para o mesmo aluno ou para o mesmo profissional.
A agenda semanal deve ser exibida de forma visual, separada por:
Aluno: mostrando suas atividades e responsáveis
Profissional: mostrando seus atendimentos eos proximos compromissos de cada aluno.
A criação de agendamento só é possível com alunos e profissionais ativos.
A edição de agendamentos respeita as mesmas validações da criação (conflitos, disponibilidade, etc.).
Cancelamentos devem ser justificados com motivo e mantidos no histórico da agenda (status = cancelado).
O sistema deve mostrar na agenda o próximo atendimento do aluno (encaminhamento) quando for visualizada por um profissional.
Filtros por semana, turma, profissional e atividade devem estar disponíveis para facilitar a navegação.
Todas as ações de agenda (criação, edição, exclusão, cancelamento) devem ser registradas em log.
Deve se ter acesso a todos os dados de Cadastro do aluno.
.

HISTÓRIAS DE USUÁRIOS

História:
HU01 – Visualizar agenda por aluno

Descrição:
COMO Gestor ou Profissional, QUERO visualizar a grade semanal de um aluno PARA acompanhar sua rotina de atendimentos e encaminhamentos.

Regras de Negócio:
Exibir dados resumidos (atividade + profissional) respeitando a LGPD.
Permitir filtro por semana.
Quando visualizada por um profissional, deve incluir indicação do próximo atendimento do aluno no mesmo dia, caso exista, para facilitar encaminhamento.
Critérios de Aceite:
Exibir blocos com atividade + responsável; permite filtrar por semana.
Caso a visualização seja feita por um profissional logado, o sistema deve exibir também a próxima atividade do aluno (profissional responsável, sala e horário).

História:
HU02 – Visualizar agenda por profissional

Descrição:
COMO profissional, QUERO ver a grade semanal dos meus atendimentos e a próxima atividade de cada aluno PARA poder encaminhá-lo ao profissional seguinte.

Regras de Negócio:
Exibir dados resumidos (aluno + atividade) respeitando a LGPD.
Permitir filtro por semana.
Para cada atendimento, mostrar qual será o próximo compromisso do aluno no mesmo dia, caso exista.

Critérios de Aceite:
Exibir blocos com aluno + atividade; permite filtrar por semana.
Ao clicar em um atendimento, exibir também dados do próximo compromisso do aluno no dia (profissional, horário, sala).

História:
HU03 – Criar agendamento

Descrição:
COMO Gestor, QUERO criar um agendamento PARA organizar a rotina semanal.

Regras de Negócio:
Agendamento deve conter aluno, profissional, atividade, data e horários.
Não permitir sobreposição para mesmo aluno ou profissional.
Somente registros ativos podem ser agendados.

Critérios de Aceite:
Criação válida salva e atualiza visualização.
Conflito bloqueia operação com mensagem clara.

História:
HU04 – Editar agendamento

Descrição:
COMO Gestor, QUERO alterar horário ou responsável de um agendamento PARA ajustar a grade.

Regras de Negócio:
Alterações respeitam regra de não sobreposição.
Critérios de Aceite:
Alteração sem conflito salva com sucesso.
Alteração com conflito é bloqueada.

História:
HU05 – Cancelar agendamento

Descrição:

COMO Gestor, QUERO cancelar um agendamento registrando motivo PARA manter histórico.
Regras de Negócio:
Cancelamento registra motivo e mantém registro visível.

Critérios de Aceite:
Status “Cancelado” visível na agenda.
Motivo registrado.

UC05 Gerenciar Atividades
Objetivo:
Permitir ao Gestor cadastrar, editar, listar e excluir atividades educacionais e terapêuticas, configurando tipo, duração padrão e categoria visual (ex: cor), para uso posterior nos agendamentos dos alunos.

Regras de Negócio:
Cada atividade deve conter nome, tipo (ex: psicologia, musicoterapia), e duração padrão.
Atividades podem ser categorizadas por cor para facilitar visualização na agenda.
Atividades ativas podem ser atribuídas a agendamentos.
A exclusão de uma atividade só é permitida se ela não estiver vinculada a agendamentos ativos.
Editar uma atividade impacta apenas agendamentos futuros.
HISTÓRIAS DE USUÁRIOS

História:
HU01 – Cadastrar Atividade

Descrição:
COMO Gestor, QUERO cadastrar uma nova atividade informando nome, tipo e duração padrão PARA que ela possa ser atribuída a alunos.

Regras de Negócio:
Nome deve ser único. Duração padrão mínima de 15 minutos.
Critérios de Aceite:
Cadastro salvo corretamente com todos os campos preenchidos.

História:
HU02 – Editar Atividade

Descrição:
COMO Gestor, QUERO listar ou filtrar atividades cadastradas POR nome, tipo ou status PARA facilitar o gerenciamento.

Regras de Negócio:
Listagem paginada com filtros combináveis.

Critérios de Aceite:
Alteração salva com sucesso. Agendamentos futuros usam os novos dados.

História:
HU03 – Listar/Pesquisar Atividades

Descrição:
.COMO Gestor, QUERO listar ou filtrar atividades cadastradas POR nome, tipo ou status PARA facilitar o gerenciamento.

Regras de Negócio:
Listagem paginada com filtros combináveis.

Critérios de Aceite:
Pesquisa exibe resultados corretos conforme filtros. Paginação funcional.

História:
HU04 – Inativar ou Excluir Atividade

Descrição:
COMO Gestor, QUERO inativar ou excluir atividades que não serão mais usadas PARA manter a base de dados organizada.

Regras de Negócio:
Exclusão permitida apenas se a atividade não estiver em uso. Atividades inativas não aparecem para agendamento.
Critérios de Aceite:
Sistema bloqueia exclusão se houver dependências. Atividade inativa não aparece nos cadastros.

UC06 Publicar/Consultar Mural de Avisos
Objetivo:
Objetivo:
Permitir comunicação interna por setor com avisos e recados.

Regras de Negócio:
Todo aviso deve conter: remetente, conteúdo, data/hora e setor de destino (ou "todos").
O conteúdo do aviso deve respeitar o limite de até 2.000 caracteres.
Avisos publicados devem ser exibidos imediatamente para os setores selecionados.
O mural deve permitir consulta dos avisos por qualquer usuário autenticado.
Os avisos devem ser ordenados por data de publicação, com os mais recentes no topo.
O sistema deve oferecer uma opção de “marcar como lido” por usuário.

Avisos devem permanecer visíveis por padrão por 30 dias, podendo ser removidos manualmente antes disso por gestores.
O mural deve ser acessível a todos os perfis (gestor, profissional, secretaria).

HISTÓRIAS DE USUÁRIOS

História:
HU01 – Publicar aviso

Descrição:
COMO Gestor, QUERO cadastrar um profissional PARA incluí-lo nas agendas.

Regras de Negócio:
Aviso contém remetente, conteúdo e data/hora.
Conteúdo máximo de 2.000 caracteres.
Aviso exibido imediatamente por todos os setores.
Critérios de Aceite:
Aviso publicado aparece na lista dos setores escolhidos.
Limite de caracteres respeitado.

História:
HU02 – Consultar Mural

Descrição:
COMO usuário, QUERO visualizar avisos do meu setor e gerais PARA me manter informado.

Regras de Negócio:
Avisos ordenados por data, fixos no topo.

Critérios de Aceite:
Lista retorna avisos corretos para todos os usuário.
Função “marcar como lido” atualiza status.

UC07 Consulta Agenda (Profissional)
Objetivo:
Permitir ao profissional visualizar sua própria agenda e detalhes dos atendimentos.
Regras de Negócio:
A visualização é somente leitura (sem botões de edição ou exclusão).
Profissionais podem visualizar apenas:Sua própria agenda completa, Agenda dos alunos que atendem
Secretarias e gestores podem consultar agendas de qualquer aluno ou profissional.
A exibição deve ser organizada em formato de grade semanal, com opção de navegação entre semanas.
Dados pessoais sensíveis devem respeitar a LGPD — sem expor informações além do necessário.

HISTÓRIAS DE USUÁRIOS

História:
HU01 – Ver minha agenda

Descrição:
COMO Profissional, QUERO ver minha grade semanal PARA acompanhar meus atendimentos.

Regras de Negócio:
Profissional só pode ver seus próprios agendamentos.
Exibir detalhes permitidos conforme LGPD.
Permitir filtro por semana e atividade.
Critérios de Aceite:
Lista de atendimentos corresponde ao usuário logado.
Filtro por semana e atividade retorna dados corretos.

História:
HU02 – Receber Notificações de alterações

Descrição:
COMO Profissional, QUERO ser notificado quando um agendamento meu for alterado/cancelado PARA me organizar.

Regras de Negócio:
Notificação deve conter aluno, data/hora e tipo de alteração.
Notificações exibidas em tempo real e armazenadas em histórico.

Critérios de Aceite:
Alteração gera notificação instantânea.
Histórico registra todas as notificações.

UC08 Administração do Sistema

Objetivo:
Permitir ao Gestor realizar a administração centralizada do sistema, incluindo configurações de disponibilidade dos profissionais, gerenciamento de agendamentos, visualização de logs e controle de permissões básicas, garantindo a manutenção eficiente e segura da aplicação.
Regras de Negócio:
Apenas usuários com perfil de Gestor têm acesso ao painel administrativo.
Toda ação realizada deve ser registrada em log com data/hora, tipo de ação e usuário.
Configuração de disponibilidade deve permitir:
Definir horários disponíveis por dia da semana.
Criar bloqueios manuais por datas específicas.
Logs devem ser mantidos por pelo menos 6 meses.
O gestor pode inativar temporariamente usuários/profissionais..
HISTÓRIAS DE USUÁRIOS

História:
HU01 – Configurar Disponibilidade de Profissionais

Descrição:
COMO Gestor, QUERO configurar os horários disponíveis dos profissionais PARA garantir que os agendamentos respeitem seus limites.
Regras de Negócio:
É obrigatório informar turno, dias da semana e horário de início/fim.
Critérios de Aceite:
Sistema valida sobreposição e aplica configuração nas agendas futuras.

História:
HU02 – Inativar Usuário/Profissional

Descrição:

COMO Gestor, QUERO inativar usuários ou profissionais PARA suspender temporariamente seu acesso ou vínculo a agendamentos..

Regras de Negócio:

Inativação impede acesso (usuário) ou novos agendamentos (profissional), mas mantém dados históricos
Critérios de Aceite:
Status atualizado com sucesso, sem impactar registros anteriores.

História:
HU03 – Gerenciar Agendamentos Centralizados

Descrição:
COMO Gestor, QUERO editar, mover ou excluir agendamentos de forma centralizada PARA ajustar rapidamente a grade.

Regras de Negócio:
Todas as validações de conflito devem ser aplicadas. Alterações devem atualizar visualização imediatamente.

Critérios de Aceite:
Sistema reflete mudanças sem erro e registra em log.

História:
HU04 – Exibir Menu por Perfil

Descrição:
COMO usuário autenticado, QUERO ver um menu com permissões do meu papel (Gestor/Profissional) PARA acessar apenas o que me é devido.

Regras de Negócio:
Perfis: Gestor (admin), Profissional (clínico/pedagógico).
Menu é montado por claims/roles do usuário.
Critérios de Aceite:
Gestor vê: Alunos, Profissionais, Agenda (CRUD), Mural, Relatórios (quando houver).
Profissional vê: Minha Agenda, Mural, Meu Perfil.
Acesso direto a rotas sem permissão retorna 403.

Projeto Técnico
2.1. Arquitetura Utilizada
A arquitetura adotada segue o modelo Monolítico Fullstack com Camadas, utilizando o framework Next.js. Esse modelo permite que frontend (interface de usuário) e backend (API REST) coexistam no mesmo projeto, com deploy unificado e estrutura modularizada. A comunicação com o banco de dados é feita através do sequelize ORM, garantindo segurança, consistência e performance.
📦 Componentes
Next.js (Frontend + Backend): Interface React e APIs em um único repositório.

PostgreSQL (Railway): Armazena dados de alunos, agendamentos, usuários, avisos etc.

sequelize ORM: Camada de acesso ao banco com validação e segurança.

JWT: Autenticação com controle de acesso por perfil (gestor, profissional, secretaria).

🎯 Justificativa
Esta arquitetura foi escolhida por oferecer:
Simplicidade no desenvolvimento (um único projeto)

Deploy rápido e gratuito (Vercel + Railway)

Escalabilidade moderada suficiente para o uso da APAE

Baixa complexidade para transferência futura ou manutenção
2.2. Ferramentas e Tecnologias
Adicionar na tabela abaixo, quais tecnologias e ferramentas serão utilizadas para desenvolver o projeto
Tecnologia /Ferramenta
Versão
Objetivo
Microsoft Word
2025
Elaboração do documento de visão do produto
Astah UML
8.4.0
Modelagem de diagramas UML para o DVP
dbdiagram.io
Plataforma

Next.js
14.2.3
Framework React para frontend e backend integrados (fullstack).
React
18.2.0
Biblioteca para construção da interface do usuário.
Sequelize
6.35.1
ORM para acesso ao banco de dados relacional com Sintaxe simples..
PostgreSQL
15.5
Sistema gerenciador de banco de dados relacional.
Vercel
plataforma
Deploy gratuito do frontend/backend Next.js
Railway
Plataforma
Hospedagem gratuita do banco de dados PostgreSQL
JWT
9.0.2
Biblioteca para geração e verificação de JWT para autenticação.
bcrypt
5.1.1
Criptografia de senhas para autenticação segura.
Material UI (MUI)
5.15.14
Biblioteca de componentes UI prontos com estilo moderno.
React Big Calendar
1.11.4
Exibição de agendas em formato semanal/mensal (grade de horários).
JsPDF
2.5.1
Geração de arquivos PDF no frontend para exportação de agendas.

2.3 Modelo Lógico do Banco de Dados

OBS: Relacionamentos Descritos
Entidade A
Entidade B
Tipo
Descrição
Usuario
mural_avisos
1:N
Um usuário pode publicar varios avisos
Usuario
log_acao
1:N
Um usuário pode gerar várias acções no sistema
Aluno
agendamentos
1:N
Um aluno pode ter vários agendamentos
Profissional
agendamentos
1:N
Um profissional pode realizar vários atendimentos
Atividade
agendamentos
1:N
Uma atividade pode ser agendada diversas vezes
Profissional
disponibilidade
N:N
Um profissional pode ter várias janelas de disponibilidade
Aluno
profissional
N:N
Um aluno pode ter vários profissionais e vice-versa
Aluno
atividade
N:N
Um aluno pode participar de várias atividades e vice-versa(via agendamento)
Profissional
atividade
N:N
Um profissional pode conduzir várias atividades e vice-versa(via agendamento)

Cronograma de Codificação do Projeto

Período
Entrega
16 a 22 setembro
Estruturação do projeto com Next.js, Sequelize e PostgreSQL. Configuração de repositório, rotas básicas, e conexão com banco.
23 a 29 setembro
Módulo de autenticação (JWT) com cadastro, login e controle de perfis.
30 setembro a 6 outubro
CRUD de Usuários e painel básico de gestão de permissões.
7 a 13 outubro
CRUD de Alunos com filtros (nome, turma, turno) e vínculos com atividades/profissionais.
14 a 20 outubro
CRUD de Profissionais, com cadastro de disponibilidade por dia da semana.
21 a 27 outubro
CRUD de Atividades com tipo, cor, duração padrão.
28 outubro a 3 novembro
Módulo de Agendamento (criação e edição) com regras para evitar conflitos.
4 a 10 novembro
Visualização da Agenda semanal por aluno e por profissional com FullCalendar ou similar.
11 a 17 novembro
Módulo de Mural de Avisos e início da Administração (logs, filtros, painel do gestor).
18 a 24 novembro
Finalização de pendências: filtros, geração de PDF e ajustes gerais
25 novembro a 1 dezembro
Testes finais, validações e preparação para entrega e apresentação final.
2 dezembro
Apresentação do Projeto Final
