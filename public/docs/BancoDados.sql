CREATE TABLE "usuario" (
  "id" serial PRIMARY KEY,
  "nome" varchar,
  "email" varchar UNIQUE,
  "senha" varchar,
  "perfil" varchar,
  "status" boolean,
  "criado_em" timestamp
);

CREATE TABLE "aluno" (
  "id" serial PRIMARY KEY,
  "nome" varchar,
  "idade" int,
  "turma" varchar,
  "turno" varchar,
  "escola_regular" varchar,
  "serie" varchar,
  "cidade" varchar,
  "responsavel_nome" varchar,
  "responsavel_telefone" varchar,
  "status" boolean,
  "observacoes" text,
  "criado_em" timestamp
);

CREATE TABLE "profissional" (
  "id" serial PRIMARY KEY,
  "nome" varchar,
  "setor" varchar,
  "especialidade" varchar,
  "status" boolean,
  "criado_em" timestamp
);

CREATE TABLE "atividade" (
  "id" serial PRIMARY KEY,
  "nome" varchar,
  "tipo" varchar,
  "duracao_padrao" int,
  "cor" varchar,
  "status" boolean,
  "criado_em" timestamp
);

CREATE TABLE "agendamento" (
  "id" serial PRIMARY KEY,
  "aluno_id" int,
  "profissional_id" int,
  "atividade_id" int,
  "data" date,
  "hora_inicio" time,
  "hora_fim" time,
  "status" varchar,
  "motivo_cancelamento" text,
  "criado_em" timestamp
);

CREATE TABLE "mural_avisos" (
  "id" serial PRIMARY KEY,
  "remetente_id" int,
  "conteudo" text,
  "data_publicacao" timestamp,
  "setor_destino" varchar,
  "visivel_ate" timestamp
);

CREATE TABLE "disponibilidade" (
  "id" serial PRIMARY KEY,
  "profissional_id" int,
  "dia_semana" varchar,
  "hora_inicio" time,
  "hora_fim" time
);

CREATE TABLE "log_acao" (
  "id" serial PRIMARY KEY,
  "usuario_id" int,
  "acao" varchar,
  "entidade_afetada" varchar,
  "id_entidade" int,
  "timestamp" timestamp
);

ALTER TABLE "agendamento" ADD FOREIGN KEY ("aluno_id") REFERENCES "aluno" ("id");

ALTER TABLE "agendamento" ADD FOREIGN KEY ("profissional_id") REFERENCES "profissional" ("id");

ALTER TABLE "agendamento" ADD FOREIGN KEY ("atividade_id") REFERENCES "atividade" ("id");

ALTER TABLE "mural_avisos" ADD FOREIGN KEY ("remetente_id") REFERENCES "usuario" ("id");

ALTER TABLE "disponibilidade" ADD FOREIGN KEY ("profissional_id") REFERENCES "profissional" ("id");

ALTER TABLE "log_acao" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id");
