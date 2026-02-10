import { supabase } from './supabase.js'

export const agendamentoService = {
  // Criar novo agendamento
  async create(agendamento) {
    try {
      // ── VALIDAÇÃO PRÉVIA: verificar conflito antes de salvar ──
      const { data: existentes } = await supabase
        .from('agendamentos')
        .select('id, horario_inicio, horario_fim, nome_cliente')
        .eq('data', agendamento.data)
        .eq('status', 'ativo')

      if (existentes && existentes.length > 0) {
        const [hIni, mIni] = agendamento.horario_inicio.split(':').map(Number)
        const [hFim, mFim] = agendamento.horario_fim.split(':').map(Number)
        const novoIni = hIni * 60 + mIni
        const novoFim = hFim * 60 + mFim

        const conflito = existentes.find(ex => {
          const [exHIni, exMIni] = ex.horario_inicio.split(':').map(Number)
          const [exHFim, exMFim] = ex.horario_fim.split(':').map(Number)
          const exIni = exHIni * 60 + exMIni
          const exFim = exHFim * 60 + exMFim

          return (
            (novoIni >= exIni && novoIni < exFim) ||
            (novoFim > exIni && novoFim <= exFim) ||
            (novoIni <= exIni && novoFim >= exFim)
          )
        })

        if (conflito) {
          return {
            data: null,
            error: {
              message: `Horário ${agendamento.horario_inicio} já está ocupado por ${conflito.nome_cliente}. Escolha outro horário.`
            }
          }
        }
      }
      // ── FIM DA VALIDAÇÃO PRÉVIA ──

      const { data, error } = await supabase
        .from('agendamentos')
        .insert({
          user_id: agendamento.user_id,
          nome_cliente: agendamento.nome_cliente,
          data: agendamento.data,
          horario_inicio: agendamento.horario_inicio,
          horario_fim: agendamento.horario_fim,
          servico: agendamento.servico,
          valor: agendamento.valor,
          observacoes_cliente: agendamento.observacoes_cliente || null,
          status: 'ativo'
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      // Extrair mensagem legível do erro do Supabase/trigger
      const mensagem = error?.message || error?.details || error?.hint || 'Erro ao criar agendamento'
      return { data: null, error: { message: mensagem } }
    }
  },

  // Buscar agendamentos do usuário
  async getByUser(userId) {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: true })
        .order('horario_inicio', { ascending: true })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
      return { data: null, error }
    }
  },

  // Buscar todos os agendamentos (admin)
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          users (
            nome,
            email
          )
        `)
        .order('data', { ascending: true })
        .order('horario_inicio', { ascending: true })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Erro ao buscar todos agendamentos:', error)
      return { data: null, error }
    }
  },

  // Buscar agendamentos por data
  async getByDate(date) {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('data', date)
        .eq('status', 'ativo')
        .order('horario_inicio', { ascending: true })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Erro ao buscar agendamentos por data:', error)
      return { data: null, error }
    }
  },

  // Buscar agendamentos do mês (admin)
  async getByMonth(year, month) {
    try {
      // Calcular primeiro e último dia do mês corretamente
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0) // Último dia do mês
      
      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]

      console.log('Buscando agendamentos entre:', startDateStr, 'e', endDateStr)

      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          users (
            nome,
            email
          )
        `)
        .gte('data', startDateStr)
        .lte('data', endDateStr)
        .order('data', { ascending: true })
        .order('horario_inicio', { ascending: true })

      console.log('Resultado da query:', { data, error })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Erro ao buscar agendamentos do mês:', error)
      return { data: null, error }
    }
  },

  // Cancelar agendamento
  async cancel(id) {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .update({ status: 'cancelado' })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error)
      const mensagem = error?.message || error?.details || error?.hint || 'Erro ao cancelar agendamento'
      return { data: null, error: { message: mensagem } }
    }
  },

  // Editar agendamento (admin)
  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error)
      return { data: null, error }
    }
  },

  // Verificar se horário está disponível
  async isTimeSlotAvailable(date, horario_inicio, horario_fim, excludeId = null) {
    try {
      let query = supabase
        .from('agendamentos')
        .select('id')
        .eq('data', date)
        .eq('status', 'ativo')

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      // Verificar conflito de horários
      const { data, error } = await query.or(
        `and(horario_inicio.lte.${horario_inicio},horario_fim.gt.${horario_inicio}),` +
        `and(horario_inicio.lt.${horario_fim},horario_fim.gte.${horario_fim}),` +
        `and(horario_inicio.gte.${horario_inicio},horario_fim.lte.${horario_fim})`
      )

      if (error) throw error
      return { available: data.length === 0, error: null }
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error)
      return { available: false, error }
    }
  }
}
