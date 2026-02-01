# 🚀 Guia de Deploy e Manutenção

Este guia complementar fornece instruções detalhadas para fazer deploy, manutenção e troubleshooting do sistema.

## 📤 Deploy em Produção

### Opção 1: Vercel (Recomendado - Mais Fácil)

#### Via Interface Web (Método mais simples)

1. **Criar conta no Vercel**
   - Acesse [vercel.com](https://vercel.com)
   - Faça login com GitHub (recomendado)

2. **Preparar o projeto**
   - Crie um repositório no GitHub
   - Faça upload dos arquivos do projeto

3. **Importar projeto**
   - No Vercel, clique em "Add New..." > "Project"
   - Selecione o repositório do GitHub
   - Configure:
     - Framework Preset: Vite
     - Root Directory: ./
     - Build Command: `npm run build`
     - Output Directory: `dist`

4. **Configurar variáveis de ambiente**
   - Na página de configuração, em "Environment Variables"
   - Adicione:
     ```
     VITE_SUPABASE_URL = sua_url_aqui
     VITE_SUPABASE_ANON_KEY = sua_chave_aqui
     ```

5. **Deploy**
   - Clique em "Deploy"
   - Aguarde 2-3 minutos
   - Seu site estará no ar! 🎉

#### Via CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Na pasta do projeto, executar
vercel

# Seguir as instruções:
# - Set up and deploy? Yes
# - Which scope? (sua conta)
# - Link to existing project? No
# - Project name? barbearia-presenca
# - In which directory? ./
# - Override settings? No

# Configurar variáveis de ambiente
vercel env add VITE_SUPABASE_URL
# Cole o valor quando solicitado

vercel env add VITE_SUPABASE_ANON_KEY
# Cole o valor quando solicitado

# Deploy para produção
vercel --prod
```

### Opção 2: Netlify

#### Via Interface Web

1. **Criar conta no Netlify**
   - Acesse [netlify.com](https://netlify.com)
   - Faça login

2. **Deploy manual (ZIP)**
   - Execute `npm run build` localmente
   - Comprima a pasta `dist` em um arquivo ZIP
   - Arraste o ZIP para a área de drop do Netlify

3. **Configurar variáveis de ambiente**
   - Vá em Site Settings > Environment variables
   - Adicione as duas variáveis:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

4. **Rebuild**
   - Vá em Deploys > Trigger deploy > Clear cache and deploy site

#### Via CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Fazer login
netlify login

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist

# Configurar variáveis no painel web
```

### Opção 3: GitHub Pages + Cloudflare Pages

Veja documentação específica do Cloudflare Pages para Vite.

## 🔐 Segurança em Produção

### 1. Proteger Credenciais

- ✅ **NUNCA** commite o arquivo `.env` no Git
- ✅ Use variáveis de ambiente na plataforma de hospedagem
- ✅ Rotacione as chaves do Supabase periodicamente

### 2. Configurar CORS no Supabase

1. Vá no painel do Supabase
2. Project Settings > API > CORS
3. Adicione seu domínio de produção

### 3. Habilitar SSL/HTTPS

- Vercel e Netlify fornecem SSL automaticamente
- Certifique-se de que está ativo

## 🔧 Manutenção do Sistema

### Backup do Banco de Dados

```sql
-- No SQL Editor do Supabase, execute:

-- Backup de usuários
COPY (SELECT * FROM users) TO '/tmp/users_backup.csv' WITH CSV HEADER;

-- Backup de agendamentos
COPY (SELECT * FROM agendamentos) TO '/tmp/agendamentos_backup.csv' WITH CSV HEADER;
```

Ou use a ferramenta de backup nativa do Supabase:
1. Database > Backups
2. Agende backups automáticos (plano pago)

### Monitoramento

#### Logs do Supabase
1. Vá em Database > Logs
2. Monitore erros e queries lentas

#### Analytics
1. Configure Google Analytics (opcional)
2. Monitore acessos e comportamento

### Atualizar o Sistema

#### Atualizar Dependências

```bash
# Verificar atualizações
npm outdated

# Atualizar todas
npm update

# Atualizar Supabase especificamente
npm install @supabase/supabase-js@latest

# Testar localmente
npm run dev

# Se tudo ok, fazer deploy
vercel --prod
```

#### Modificar Banco de Dados

```sql
-- Sempre teste em desenvolvimento primeiro!
-- Exemplo: Adicionar nova coluna

ALTER TABLE agendamentos 
ADD COLUMN desconto DECIMAL(5,2) DEFAULT 0;

-- Atualizar políticas RLS se necessário
```

## 🐛 Troubleshooting Comum

### Erro: "Failed to fetch"

**Causa**: Problema de CORS ou URL incorreta

**Solução**:
1. Verifique se a URL do Supabase está correta
2. Adicione o domínio nas configurações de CORS do Supabase
3. Limpe o cache do navegador

### Erro: "Row Level Security policy violation"

**Causa**: Políticas RLS muito restritivas

**Solução**:
```sql
-- Revisar políticas no Supabase
SELECT * FROM pg_policies WHERE tablename = 'agendamentos';

-- Ajustar conforme necessário
```

### Erro: "Invalid API key"

**Causa**: Chave anon pública incorreta

**Solução**:
1. Copie novamente do Supabase (Project Settings > API)
2. Atualize a variável de ambiente
3. Redeploy o projeto

### Site não atualiza após deploy

**Causa**: Cache do CDN/browser

**Solução**:
```bash
# Limpar cache no Vercel
vercel --prod

# Ou force refresh no navegador
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

## 📊 Monitoramento de Performance

### Métricas Importantes

1. **Tempo de carregamento**
   - Use Lighthouse (Chrome DevTools)
   - Meta: < 3 segundos

2. **Queries do banco**
   - Monitore no Supabase Dashboard
   - Otimize queries lentas

3. **Erros de JavaScript**
   - Configure Sentry ou similar (opcional)

### Otimizações

#### CSS
```bash
# Minificar automaticamente no build
npm run build
```

#### JavaScript
```bash
# Já minificado pelo Vite
```

#### Imagens (se adicionar)
```bash
# Use ferramentas como:
npm install -g sharp-cli
```

## 🔄 Atualizações e Novas Funcionalidades

### Adicionar Nova Página

1. Criar arquivo em `src/pages/NovaPagina.js`
2. Adicionar rota em `src/app.js`
3. Adicionar link no Header se necessário

### Adicionar Novo Serviço

1. Editar `src/utils/helpers.js`
2. Adicionar na constante `SERVICOS`
3. Fazer deploy

### Modificar Horários

1. Editar `src/utils/helpers.js`
2. Modificar `HORARIO_FUNCIONAMENTO` ou `HORARIOS_FIXOS`
3. Fazer deploy

## 🆘 Suporte Técnico

### Logs Úteis

#### Navegador (Cliente)
```javascript
// Abrir Console (F12)
// Verificar erros em vermelho
// Verificar network requests
```

#### Supabase (Servidor)
```
Database > Logs
> Query Performance
> API Logs
```

### Restaurar Backup

```sql
-- Restaurar usuários
COPY users FROM '/tmp/users_backup.csv' WITH CSV HEADER;

-- Restaurar agendamentos
COPY agendamentos FROM '/tmp/agendamentos_backup.csv' WITH CSV HEADER;
```

## 📞 Contatos Importantes

- **Supabase Support**: https://supabase.com/support
- **Vercel Support**: https://vercel.com/support
- **Netlify Support**: https://www.netlify.com/support/

## 🎓 Recursos Adicionais

### Documentação

- [Supabase Docs](https://supabase.com/docs)
- [Vite Docs](https://vitejs.dev/)
- [MDN Web Docs](https://developer.mozilla.org/)

### Tutoriais

- Supabase YouTube Channel
- Vite Crash Course
- JavaScript ES6+ Features

## ✅ Checklist de Deploy

Antes de fazer deploy em produção:

- [ ] Testar localmente todas as funcionalidades
- [ ] Verificar se `.env` não está no Git
- [ ] Configurar variáveis de ambiente na plataforma
- [ ] Executar `npm run build` sem erros
- [ ] Testar build localmente com `npm run preview`
- [ ] Configurar CORS no Supabase
- [ ] Verificar políticas RLS
- [ ] Criar usuário admin de produção
- [ ] Testar login e cadastro
- [ ] Testar criação de agendamento
- [ ] Testar área administrativa
- [ ] Verificar responsividade mobile
- [ ] Testar em diferentes navegadores
- [ ] Configurar domínio customizado (opcional)
- [ ] Documentar credenciais de acesso

## 🎉 Conclusão

Com este guia, você deve conseguir:
- ✅ Fazer deploy do sistema
- ✅ Manter o sistema atualizado
- ✅ Resolver problemas comuns
- ✅ Adicionar novas funcionalidades

**Boa sorte com seu sistema de agendamento!** 🚀

---

**Dúvidas?** Consulte a documentação oficial das tecnologias usadas.
