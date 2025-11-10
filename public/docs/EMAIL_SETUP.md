# Configuração de Email - Recuperação de Senha

## Como Funciona a Recuperação

1. **Usuário solicita recuperação**: Informa o email na página "Esqueci minha senha"
2. **Sistema gera token**: Um token único e seguro é gerado e salvo no banco
3. **Email é enviado**: Link de recuperação é enviado por email com o token
4. **Usuário acessa link**: Link como `/auth/reset?token=XXXXX`
5. **Nova senha**: Usuário define nova senha usando o token
6. **Token expira**: Token é invalidado após uso ou após 30 minutos

## Configuração do Serviço de Email

### Opção 1: Gmail (Recomendado para testes)

1. Ative a verificação em duas etapas na sua conta Google
2. Crie uma "Senha de app":
   - Acesse: https://myaccount.google.com/apppasswords
   - Gere uma senha de app para "Email"
   - Use essa senha no `SMTP_PASSWORD`

**Variáveis de ambiente (.env.local):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-app-password-aqui
SMTP_FROM=APAE Agenda <seu-email@gmail.com>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Opção 2: Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@outlook.com
SMTP_PASSWORD=sua-senha
SMTP_FROM=APAE Agenda <seu-email@outlook.com>
```

### Opção 3: Servidor SMTP Próprio

```env
SMTP_HOST=smtp.seudominio.com.br
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=no-reply@seudominio.com.br
SMTP_PASSWORD=sua-senha
SMTP_FROM=APAE Agenda <no-reply@seudominio.com.br>
```

### Opção 4: Serviços de Email Transacional

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=sua-api-key-do-sendgrid
SMTP_FROM=APAE Agenda <no-reply@seudominio.com.br>
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@seudominio.com.br
SMTP_PASSWORD=sua-senha-do-mailgun
SMTP_FROM=APAE Agenda <no-reply@seudominio.com.br>
```

## Modo Desenvolvimento (Sem Email Configurado)

Se você não configurar as variáveis de email, o sistema funcionará em modo desenvolvimento:
- Token será exibido no console do servidor
- Link de recuperação será mostrado nos logs
- Você pode copiar o link e testar manualmente

## Como Testar

1. Configure as variáveis de ambiente no arquivo `.env.local`
2. Reinicie o servidor Next.js
3. Acesse a página "Esqueci minha senha"
4. Informe um email cadastrado
5. Verifique a caixa de entrada do email
6. Clique no link recebido
7. Defina uma nova senha

## Solução de Problemas

### Email não está sendo enviado

1. Verifique se as variáveis estão configuradas corretamente
2. Verifique os logs do servidor para erros
3. Teste as credenciais SMTP
4. Para Gmail, certifique-se de usar uma "App Password" e não a senha normal

### Email vai para spam

- Configure SPF/DKIM no seu domínio
- Use um serviço de email transacional profissional
- Certifique-se de que o remetente está correto

### Token não funciona

- Token expira em 30 minutos
- Token só pode ser usado uma vez
- Verifique se está copiando o token completo



