# 🪒 Barbearia Presença - Sistema de Agendamento

Sistema web completo de agendamento para barbearias, desenvolvido com Vanilla JavaScript, HTML5, CSS3 e Supabase como backend.

## 📋 Índice

- [Características](#características)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Guia de Instalação Completo](#guia-de-instalação-completo)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Uso](#uso)

## ✨ Características

- ✅ Sistema de autenticação com Supabase Auth
- ✅ Agendamento online com verificação de conflitos
- ✅ Calendário interativo
- ✅ Horários fixos (bloqueados) automaticamente
- ✅ Área administrativa completa
- ✅ Visualização mensal de agendamentos
- ✅ Sistema de observações do cliente
- ✅ Responsivo (Mobile First)
- ✅ Interface moderna em tema escuro com dourado
- ✅ Validações de horário de funcionamento
- ✅ Controle de status de agendamentos

## 🚀 Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL + Auth)
- **Build Tool**: Vite
- **Hospedagem**: Vercel / Netlify (recomendado)

## 📦 Pré-requisitos

Antes de começar, você precisará ter instalado:

- [Node.js](https://nodejs.org/) (versão 16 ou superior)
- [npm](https://www.npmjs.com/) (vem com o Node.js)
- Conta no [Supabase](https://supabase.com/) (gratuita)

## 🔧 Guia de Instalação Completo

### Passo 1: Configurar o Supabase

#### 1.1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Name**: Barbearia Presença
   - **Database Password**: (crie uma senha forte)
   - **Region**: Brazil (São Paulo) ou mais próximo de você
5. Clique em "Create new project"
6. Aguarde 2-3 minutos enquanto o projeto é criado

#### 1.2. Configurar o Banco de Dados

1. No painel do Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em "New query"
3. Abra o arquivo `supabase/schema.sql` do projeto
4. Copie **TODO** o conteúdo do arquivo
5. Cole no SQL Editor
6. Clique em "Run" (ou pressione Ctrl+Enter)
7. Você verá "Success. No rows returned" - isso é normal!

#### 1.3. Criar Usuário Administrador

1. Vá em **Authentication** > **Users** (menu lateral)
2. Clique em "Add user" > "Create new user"
3. Preencha:
   - **Email**: seu-email@exemplo.com (use um email real)
   - **Password**: (crie uma senha forte)
   - **Auto Confirm User**: ✅ Marque esta opção
4. Clique em "Create user"
5. **IMPORTANTE**: Copie o **User UID** (UUID) que aparece na lista

#### 1.4. Tornar o Usuário Admin

1. Volte ao **SQL Editor**
2. Execute este comando (substitua SEU_UUID_AQUI pelo UUID copiado):

```sql
INSERT INTO users (id, nome, email, role)
VALUES ('SEU_UUID_AQUI', 'Administrador', 'seu-email@exemplo.com', 'admin')
ON CONFLICT (id) DO NOTHING;
```

3. Clique em "Run"

#### 1.5. Obter Credenciais do Supabase

1. Vá em **Project Settings** (ícone de engrenagem no menu lateral)
2. Clique em **API**
3. Copie:
   - **Project URL** (algo como: https://xxxxx.supabase.co)
   - **anon public** key (uma chave longa começando com "eyJ...")

⚠️ **IMPORTANTE**: Guarde essas credenciais com segurança!

### Passo 2: Configurar o Projeto Localmente

#### 2.1. Extrair os Arquivos

1. Extraia todos os arquivos do projeto para uma pasta
2. Exemplo: `C:\projetos\barbearia-presenca` (Windows) ou `~/projetos/barbearia-presenca` (Mac/Linux)

#### 2.2. Instalar Dependências

Abra o terminal/prompt de comando na pasta do projeto e execute:

```bash
npm install
```

Aguarde a instalação das dependências.

#### 2.3. Configurar Variáveis de Ambiente

1. Na pasta raiz do projeto, copie o arquivo `.env.example`
2. Renomeie a cópia para `.env`
3. Abra o arquivo `.env` em um editor de texto
4. Substitua os valores:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...sua_chave_aqui
```

5. Salve o arquivo

### Passo 3: Executar o Projeto

#### 3.1. Iniciar o Servidor de Desenvolvimento

No terminal, execute:

```bash
npm run dev
```

Você verá algo como:

```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

#### 3.2. Acessar o Sistema

1. Abra seu navegador
2. Acesse: `http://localhost:3000`
3. Você verá a página inicial do sistema!

### Passo 4: Testar o Sistema

#### 4.1. Login como Admin

1. Clique em "Entrar"
2. Use as credenciais do administrador criado no Passo 1.3
3. Você será redirecionado para a Área do Barbeiro

#### 4.2. Criar um Cliente de Teste

1. Clique em "Sair"
2. Na página inicial, clique em "Cadastrar"
3. Preencha os dados de um cliente teste
4. Faça login com este cliente
5. Teste criar um agendamento

### Passo 5: Deploy em Produção

#### Opção A: Deploy no Vercel (Recomendado)

1. Faça build do projeto:
```bash
npm run build
```

2. Instale o Vercel CLI:
```bash
npm install -g vercel
```

3. Execute:
```bash
vercel
```

4. Siga as instruções no terminal
5. Configure as variáveis de ambiente no painel do Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

#### Opção B: Deploy no Netlify

1. Faça build do projeto:
```bash
npm run build
```

2. Instale o Netlify CLI:
```bash
npm install -g netlify-cli
```

3. Execute:
```bash
netlify deploy
```

4. Siga as instruções no terminal
5. Configure as variáveis de ambiente no painel do Netlify

## 📁 Estrutura do Projeto

```
barbearia-presenca/
├── index.html              # Página HTML principal
├── package.json            # Dependências do projeto
├── vite.config.js         # Configuração do Vite
├── .env                   # Variáveis de ambiente (criar)
├── .env.example           # Exemplo de variáveis
├── src/
│   ├── app.js            # Aplicação principal e roteamento
│   ├── components/       # Componentes reutilizáveis
│   │   ├── Header.js
│   │   ├── Calendar.js
│   │   └── Modal.js
│   ├── pages/           # Páginas da aplicação
│   │   ├── LandingPage.js
│   │   ├── LoginPage.js
│   │   ├── CadastroPage.js
│   │   ├── AgendarPage.js
│   │   ├── MeusAgendamentosPage.js
│   │   └── AdminPage.js
│   ├── services/        # Serviços de integração
│   │   ├── supabase.js
│   │   ├── auth.js
│   │   └── agendamento.js
│   ├── utils/          # Utilitários e helpers
│   │   └── helpers.js
│   └── styles/         # Estilos CSS
│       └── global.css
└── supabase/          # Configuração do banco
    └── schema.sql
```

## 🎯 Funcionalidades

### Para Clientes:
- ✅ Cadastro e login
- ✅ Visualizar serviços disponíveis
- ✅ Agendar horários
- ✅ Ver agendamentos futuros
- ✅ Cancelar agendamentos
- ✅ Adicionar observações

### Para Administradores:
- ✅ Login administrativo
- ✅ Visualizar todos os agendamentos
- ✅ Visualização por mês
- ✅ Marcar agendamentos como concluídos
- ✅ Cancelar agendamentos
- ✅ Ver observações dos clientes
- ✅ Estatísticas do mês
- ✅ Relatório de receita

## 📱 Uso

### Horário de Funcionamento

- **Terça a Sábado**: 09:00 às 20:00 (intervalo: 13:00 às 15:00)
- **Segunda-feira**: 15:00 às 19:00
- **Domingo**: Fechado

### Serviços Disponíveis

| Serviço | Duração | Valor |
|---------|---------|-------|
| Cabelo | 30 min | R$ 35,00 |
| Barba | 30 min | R$ 30,00 |
| Cabelo + Barba | 60 min | R$ 60,00 |
| Luzes | 30 min | R$ 70,00 |
| Platinado | 30 min | R$ 120,00 |

### Horários Fixos (Bloqueados)

**Quinta-feira:**
- 11:00 - 11:30 (Beiço)
- 16:00 - 17:00 (Marquinhos)
- 19:00 - 20:00 (Leo)

**Sexta-feira:**
- 09:00 - 10:00 (Alessandro)
- 15:00 - 16:00 (Gu)
- 17:00 - 18:00 (Jo)
- 18:00 - 18:30 (Negão)
- 19:00 - 19:30 (Ferrugem)

**Sábado:**
- 09:00 - 09:30 (Dinho)
- 10:00 - 10:30 (Bahia)
- 11:00 - 11:30 (Gabriel)
- 12:00 - 12:30 (Marcelinho)
- 15:00 - 15:30 (Vando)

## 🐛 Solução de Problemas

### "Erro ao conectar com o Supabase"
- Verifique se as variáveis de ambiente estão corretas no arquivo `.env`
- Certifique-se de que o projeto do Supabase está ativo

### "Erro ao criar agendamento"
- Verifique se o banco de dados foi configurado corretamente (Passo 1.2)
- Confirme que as políticas RLS estão ativas

### "Não consigo fazer login como admin"
- Verifique se o usuário foi criado no Supabase Auth
- Confirme se o registro foi inserido na tabela `users` com role='admin'

### "Página em branco"
- Abra o Console do navegador (F12) para ver erros
- Verifique se todas as dependências foram instaladas (`npm install`)

## 📞 Suporte

Se encontrar problemas:
1. Verifique o Console do navegador (F12)
2. Revise os logs do Supabase
3. Confirme que seguiu todos os passos do guia

## 📝 Licença

Este projeto foi desenvolvido para uso da Barbearia Presença.

## 🎨 Créditos

Desenvolvido com ❤️ para modernizar o agendamento da Barbearia Presença.

---

**Última atualização**: Janeiro 2026
