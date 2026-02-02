import { supabase } from './supabase.js'

export const bloqueioService = {
  // Criar bloqueio de dia inteiro
  async bloquearDiaInteiro(data, motivo, criadoPor) {
    try {
      const { data: bloqueio, error } = await supabase
        .from('bloqueios')
        .insert({
          tipo: 'dia_inteiro',
          data,
          motivo,
          criado_por: criadoPor
        })
        .select()
        .single()

      if (error) throw error
      return { data: bloqueio, error: null }
    } catch (error) {
      console.error('Erro ao bloquear dia:', error)
      return { data: null, error }
    }
  },

  // Criar bloqueio de horário específico
  async bloquearHorario(data, horarioInicio, horarioFim, motivo, criadoPor) {
    try {
      const { data: bloqueio, error } = await supabase
        .from('bloqueios')
        .insert({
          tipo: 'horario_especifico',
          data,
          horario_inicio: horarioInicio,
          horario_fim: horarioFim,
          motivo,
          criado_por: criadoPor
        })
        .select()
        .single()

      if (error) throw error
      return { data: bloqueio, error: null }
    } catch (error) {
      console.error('Erro ao bloquear horário:', error)
      return { data: null, error }
    }
  },

  // Listar todos os bloqueios
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('bloqueios')
        .select(`
          *,
          users (nome, email)
        `)
        .order('data', { ascending: true })
        .order('horario_inicio', { ascending: true })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Erro ao buscar bloqueios:', error)
      return { data: null, error }
    }
  },

  // Buscar bloqueios por data
  async getByDate(data) {
    try {
      const { data: bloqueios, error } = await supabase
        .from('bloqueios')
        .select('*')
        .eq('data', data)

      if (error) throw error
      return { data: bloqueios, error: null }
    } catch (error) {
      console.error('Erro ao buscar bloqueios da data:', error)
      return { data: null, error }
    }
  },

  // Buscar bloqueios de um mês
  async getByMonth(year, month) {
    try {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0)
      
      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('bloqueios')
        .select('*')
        .gte('data', startDateStr)
        .lte('data', endDateStr)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Erro ao buscar bloqueios do mês:', error)
      return { data: null, error }
    }
  },

  // Remover bloqueio
  async remove(id) {
    try {
      const { error } = await supabase
        .from('bloqueios')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Erro ao remover bloqueio:', error)
      return { error }
    }
  },

  // Verificar se data está bloqueada (dia inteiro)
  async isDiaBloqueado(data) {
    try {
      const { data: bloqueios, error } = await supabase
        .from('bloqueios')
        .select('id')
        .eq('data', data)
        .eq('tipo', 'dia_inteiro')
        .limit(1)

      if (error) throw error
      return { bloqueado: bloqueios && bloqueios.length > 0, error: null }
    } catch (error) {
      console.error('Erro ao verificar bloqueio de dia:', error)
      return { bloqueado: false, error }
    }
  },

  // Verificar se horário está bloqueado
  async isHorarioBloqueado(data, horarioInicio, horarioFim) {
    try {
      const { data: bloqueios, error } = await supabase
        .from('bloqueios')
        .select('*')
        .eq('data', data)

      if (error) throw error

      if (!bloqueios || bloqueios.length === 0) {
        return { bloqueado: false, error: null }
      }

      // Verificar se dia inteiro está bloqueado
      const diaInteiroBloqueado = bloqueios.some(b => b.tipo === 'dia_inteiro')
      if (diaInteiroBloqueado) {
        return { bloqueado: true, motivo: 'Dia inteiro bloqueado', error: null }
      }

      // Verificar conflito com horários específicos
      const horarioBloqueado = bloqueios.find(b => {
        if (b.tipo === 'horario_especifico') {
          const bloqInicio = b.horario_inicio
          const bloqFim = b.horario_fim
          
          // Verifica se há sobreposição
          return (
            (bloqInicio <= horarioInicio && bloqFim > horarioInicio) ||
            (bloqInicio < horarioFim && bloqFim >= horarioFim) ||
            (bloqInicio >= horarioInicio && bloqFim <= horarioFim)
          )
        }
        return false
      })

      if (horarioBloqueado) {
        return { 
          bloqueado: true, 
          motivo: horarioBloqueado.motivo || 'Horário bloqueado',
          error: null 
        }
      }

      return { bloqueado: false, error: null }
    } catch (error) {
      console.error('Erro ao verificar horário bloqueado:', error)
      return { bloqueado: false, error }
    }
  }
}
