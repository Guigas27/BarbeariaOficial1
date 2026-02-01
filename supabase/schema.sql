-- ============================================
-- BARBEARIA PRESENÇA - CONFIGURAÇÃO DO BANCO
-- ============================================

-- 1. CRIAR TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'cliente')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRIAR TABELA DE AGENDAMENTOS
CREATE TABLE IF NOT EXISTS agendamentos (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nome_cliente TEXT NOT NULL,
  data DATE NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  servico TEXT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  observacoes_cliente TEXT,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'cancelado', 'concluido')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRIAR ÍNDICES PARA MELHOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_agendamentos_user_id ON agendamentos(user_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 4. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS DE SEGURANÇA PARA USERS

-- Usuários podem ver apenas seus próprios dados
CREATE POLICY "Users can view own data" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Usuários podem atualizar apenas seus próprios dados
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Admins podem ver todos os usuários
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Permitir inserção durante cadastro (será usado por trigger)
CREATE POLICY "Allow insert during signup" ON users
  FOR INSERT
  WITH CHECK (true);

-- 6. POLÍTICAS DE SEGURANÇA PARA AGENDAMENTOS

-- Clientes podem ver apenas seus próprios agendamentos
CREATE POLICY "Clients can view own appointments" ON agendamentos
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- Clientes podem criar agendamentos
CREATE POLICY "Clients can create appointments" ON agendamentos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Clientes podem atualizar seus próprios agendamentos (apenas observações)
CREATE POLICY "Clients can update own appointments" ON agendamentos
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins podem ver todos os agendamentos
CREATE POLICY "Admins can view all appointments" ON agendamentos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins podem criar qualquer agendamento
CREATE POLICY "Admins can create appointments" ON agendamentos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins podem atualizar qualquer agendamento
CREATE POLICY "Admins can update all appointments" ON agendamentos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins podem deletar qualquer agendamento
CREATE POLICY "Admins can delete appointments" ON agendamentos
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 7. FUNÇÃO PARA VERIFICAR CONFLITOS DE HORÁRIO
CREATE OR REPLACE FUNCTION check_appointment_conflict()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se já existe um agendamento ativo no mesmo horário
  IF EXISTS (
    SELECT 1 FROM agendamentos
    WHERE data = NEW.data
      AND status = 'ativo'
      AND id != COALESCE(NEW.id, 0)
      AND (
        (horario_inicio <= NEW.horario_inicio AND horario_fim > NEW.horario_inicio)
        OR (horario_inicio < NEW.horario_fim AND horario_fim >= NEW.horario_fim)
        OR (horario_inicio >= NEW.horario_inicio AND horario_fim <= NEW.horario_fim)
      )
  ) THEN
    RAISE EXCEPTION 'Já existe um agendamento neste horário';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. TRIGGER PARA VERIFICAR CONFLITOS
DROP TRIGGER IF EXISTS check_appointment_conflict_trigger ON agendamentos;
CREATE TRIGGER check_appointment_conflict_trigger
  BEFORE INSERT OR UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION check_appointment_conflict();

-- 9. INSERIR USUÁRIO ADMIN PADRÃO (OPCIONAL)
-- IMPORTANTE: Altere o email e crie o usuário no Supabase Auth primeiro
-- Depois execute este comando substituindo o UUID pelo ID gerado:
-- 
-- INSERT INTO users (id, nome, email, role)
-- VALUES ('SEU_UUID_AQUI', 'Administrador', 'admin@barbearia.com', 'admin')
-- ON CONFLICT (id) DO NOTHING;

-- ============================================
-- FIM DA CONFIGURAÇÃO
-- ============================================

-- Para criar o admin, siga estes passos:
-- 1. No painel do Supabase, vá em Authentication > Users
-- 2. Crie um novo usuário com email e senha
-- 3. Copie o UUID do usuário criado
-- 4. Execute o comando acima substituindo SEU_UUID_AQUI pelo UUID copiado
