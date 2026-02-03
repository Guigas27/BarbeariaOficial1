// Serviços disponíveis
export const SERVICOS = [
  { nome: 'Cabelo', duracao: 30, valor: 35 },
  { nome: 'Barba', duracao: 30, valor: 30 },
  { nome: 'Cabelo + Barba', duracao: 60, valor: 60 },
  { nome: 'Luzes', duracao: 30, valor: 70 },
  { nome: 'Platinado', duracao: 30, valor: 120 }
]

// Horários fixos (bloqueados) por dia da semana
// 4 = Quinta, 5 = Sexta, 6 = Sábado
export const HORARIOS_FIXOS = {
  4: [ // Quinta-feira
    { nome: 'Beiço', inicio: '11:00', fim: '11:30' },
    { nome: 'Marquinhos', inicio: '19:00', fim: '20:00' },
    { nome: 'Leo', inicio: '10:00', fim: '11:00' }
  ],
  5: [ // Sexta-feira
    { nome: 'Alessandro', inicio: '09:00', fim: '10:00' },
    { nome: 'Gu', inicio: '15:00', fim: '16:00' },
    { nome: 'Jo', inicio: '17:00', fim: '18:00' },
    { nome: 'Negão', inicio: '18:00', fim: '18:30' },
    { nome: 'Ferrugem', inicio: '18:30', fim: '19:00' },
    { nome: 'Gui', inicio: '11:00', fim: '11:30' }
  ],
  6: [ // Sábado
    { nome: 'Dinho', inicio: '09:00', fim: '09:30' },
    { nome: 'Bahia', inicio: '10:00', fim: '10:30' },
    { nome: 'Gabriel', inicio: '11:00', fim: '11:30' },
    { nome: 'Marcelinho', inicio: '12:00', fim: '12:30' },
    { nome: 'Tiele', inicio: '15:00', fim: '15:30' },
    { nome: 'João', inicio: '16:00', fim: '17:00' },
    { nome: 'Vando', inicio: '17:00', fim: '17:30' }
  ]
}

// Horário de funcionamento por dia da semana
// 0 = Domingo, 1 = Segunda, 2 = Terça, etc.
export const HORARIO_FUNCIONAMENTO = {
  0: null, // Domingo - Fechado
  1: { inicio: '15:00', fim: '19:00', intervalo: null }, // Segunda - Especial
  2: { inicio: '09:00', fim: '20:00', intervalo: { inicio: '13:00', fim: '15:00' } }, // Terça
  3: { inicio: '09:00', fim: '20:00', intervalo: { inicio: '13:00', fim: '15:00' } }, // Quarta
  4: { inicio: '09:00', fim: '20:00', intervalo: { inicio: '13:00', fim: '15:00' } }, // Quinta
  5: { inicio: '09:00', fim: '20:00', intervalo: { inicio: '13:00', fim: '15:00' } }, // Sexta
  6: { inicio: '09:00', fim: '20:00', intervalo: { inicio: '13:00', fim: '15:00' } }  // Sábado
}

// Verificar se a barbearia está aberta em determinado dia
export function isBarberiaAberta(date) {
  const dayOfWeek = new Date(date + 'T00:00:00').getDay()
  return HORARIO_FUNCIONAMENTO[dayOfWeek] !== null
}

// Obter horário de funcionamento de um dia
export function getHorarioFuncionamento(date) {
  const dayOfWeek = new Date(date + 'T00:00:00').getDay()
  return HORARIO_FUNCIONAMENTO[dayOfWeek]
}

// Verificar se um horário está dentro do funcionamento
export function isDentroHorarioFuncionamento(date, horario) {
  const funcionamento = getHorarioFuncionamento(date)
  if (!funcionamento) return false

  const [hora, minuto] = horario.split(':').map(Number)
  const horarioMinutos = hora * 60 + minuto

  const [inicioHora, inicioMinuto] = funcionamento.inicio.split(':').map(Number)
  const inicioMinutos = inicioHora * 60 + inicioMinuto

  const [fimHora, fimMinuto] = funcionamento.fim.split(':').map(Number)
  const fimMinutos = fimHora * 60 + fimMinuto

  // Verificar se está dentro do horário geral
  if (horarioMinutos < inicioMinutos || horarioMinutos >= fimMinutos) {
    return false
  }

  // Verificar se NÃO está no intervalo (almoço)
  if (funcionamento.intervalo) {
    const [intervaloInicioHora, intervaloInicioMinuto] = funcionamento.intervalo.inicio.split(':').map(Number)
    const intervaloInicioMinutos = intervaloInicioHora * 60 + intervaloInicioMinuto

    const [intervaloFimHora, intervaloFimMinuto] = funcionamento.intervalo.fim.split(':').map(Number)
    const intervaloFimMinutos = intervaloFimHora * 60 + intervaloFimMinuto

    if (horarioMinutos >= intervaloInicioMinutos && horarioMinutos < intervaloFimMinutos) {
      return false
    }
  }

  return true
}

// Verificar se um horário é fixo (bloqueado)
export function isHorarioFixo(date, horarioInicio) {
  const dayOfWeek = new Date(date + 'T00:00:00').getDay()
  const fixos = HORARIOS_FIXOS[dayOfWeek] || []

  return fixos.some(fixo => {
    return horarioInicio >= fixo.inicio && horarioInicio < fixo.fim
  })
}

// Gerar slots de horário disponíveis para um dia
export function gerarHorariosDisponiveis(date, duracaoServico, bloqueios = [], agendamentos = []) {
  const funcionamento = getHorarioFuncionamento(date)
  if (!funcionamento) return []

  const slots = []
  const [horaInicio, minutoInicio] = funcionamento.inicio.split(':').map(Number)
  const [horaFim, minutoFim] = funcionamento.fim.split(':').map(Number)

  let currentMinutos = horaInicio * 60 + minutoInicio
  const fimMinutos = horaFim * 60 + minutoFim

  while (currentMinutos + duracaoServico <= fimMinutos) {
    const hora = Math.floor(currentMinutos / 60)
    const minuto = currentMinutos % 60
    const horarioStr = `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`

    // Calcular horário de fim do slot
    const fimSlotMinutos = currentMinutos + duracaoServico
    const horaFimSlot = Math.floor(fimSlotMinutos / 60)
    const minutoFimSlot = fimSlotMinutos % 60
    const horarioFimStr = `${String(horaFimSlot).padStart(2, '0')}:${String(minutoFimSlot).padStart(2, '0')}`

    // Verificar se TODO o período está dentro do horário de funcionamento
    let dentroHorario = true
    let minutosTeste = currentMinutos

    while (minutosTeste < currentMinutos + duracaoServico) {
      const horaTeste = Math.floor(minutosTeste / 60)
      const minTeste = minutosTeste % 60
      const horarioTeste = `${String(horaTeste).padStart(2, '0')}:${String(minTeste).padStart(2, '0')}`
      
      if (!isDentroHorarioFuncionamento(date, horarioTeste)) {
        dentroHorario = false
        break
      }
      
      minutosTeste += 30 // Verifica a cada 30min
    }

    if (!dentroHorario) {
      currentMinutos += 30
      continue
    }

    // Verificar se TODO o período passa por horário fixo (não só o início)
    let periodoTemHorarioFixo = false
    let minutosTesteFixo = currentMinutos
    
    while (minutosTesteFixo < currentMinutos + duracaoServico) {
      const horaTeste = Math.floor(minutosTesteFixo / 60)
      const minTeste = minutosTesteFixo % 60
      const horarioTeste = `${String(horaTeste).padStart(2, '0')}:${String(minTeste).padStart(2, '0')}`
      
      if (isHorarioFixo(date, horarioTeste)) {
        periodoTemHorarioFixo = true
        break
      }
      
      minutosTesteFixo += 30 // Verifica a cada 30min
    }

    if (periodoTemHorarioFixo) {
      currentMinutos += 30
      continue
    }

    // Verificar se TODO o período do serviço está livre de bloqueios
    const periodoTemBloqueio = verificarPeriodoBloqueado(
      date, 
      horarioStr, 
      horarioFimStr, 
      bloqueios
    )

    if (periodoTemBloqueio) {
      currentMinutos += 30
      continue
    }

    // Verificar se TODO o período está livre de agendamentos
    const periodoTemAgendamento = verificarPeriodoAgendado(
      date,
      horarioStr,
      horarioFimStr,
      agendamentos
    )

    if (periodoTemAgendamento) {
      currentMinutos += 30
      continue
    }

    // Se passou por todas as verificações, adiciona o slot
    slots.push({
      inicio: horarioStr,
      fim: horarioFimStr
    })

    currentMinutos += 30 // Incremento de 30 minutos
  }

  return slots
}

// Verificar se um período tem bloqueio (parcial ou total)
function verificarPeriodoBloqueado(data, horarioInicio, horarioFim, bloqueios) {
  if (!bloqueios || bloqueios.length === 0) return false

  // Converter horários para minutos
  const [inicioHora, inicioMin] = horarioInicio.split(':').map(Number)
  const [fimHora, fimMin] = horarioFim.split(':').map(Number)
  const inicioMinutos = inicioHora * 60 + inicioMin
  const fimMinutos = fimHora * 60 + fimMin

  return bloqueios.some(bloq => {
    // Se dia inteiro está bloqueado
    if (bloq.tipo === 'dia_inteiro' && bloq.data === data) {
      return true
    }

    // Se é bloqueio de horário específico
    if (bloq.tipo === 'horario_especifico' && bloq.data === data) {
      const [bloqInicioHora, bloqInicioMin] = bloq.horario_inicio.split(':').map(Number)
      const [bloqFimHora, bloqFimMin] = bloq.horario_fim.split(':').map(Number)
      const bloqInicioMinutos = bloqInicioHora * 60 + bloqInicioMin
      const bloqFimMinutos = bloqFimHora * 60 + bloqFimMin

      // Verifica se há QUALQUER sobreposição
      // O bloqueio sobrepõe se:
      // 1. Começa durante o serviço: bloqInicio >= inicio && bloqInicio < fim
      // 2. Termina durante o serviço: bloqFim > inicio && bloqFim <= fim
      // 3. Engloba todo o serviço: bloqInicio <= inicio && bloqFim >= fim
      // 4. Está contido no serviço: bloqInicio >= inicio && bloqFim <= fim
      
      return (
        (bloqInicioMinutos < fimMinutos && bloqFimMinutos > inicioMinutos)
      )
    }

    return false
  })
}

// Verificar se um período tem agendamento (parcial ou total)
function verificarPeriodoAgendado(data, horarioInicio, horarioFim, agendamentos) {
  if (!agendamentos || agendamentos.length === 0) return false

  // Converter horários para minutos
  const [inicioHora, inicioMin] = horarioInicio.split(':').map(Number)
  const [fimHora, fimMin] = horarioFim.split(':').map(Number)
  const inicioMinutos = inicioHora * 60 + inicioMin
  const fimMinutos = fimHora * 60 + fimMin

  return agendamentos.some(ag => {
    // Ignora agendamentos cancelados
    if (ag.status === 'cancelado') return false
    
    // Verifica se é da mesma data
    if (ag.data !== data) return false

    const [agInicioHora, agInicioMin] = ag.horario_inicio.split(':').map(Number)
    const [agFimHora, agFimMin] = ag.horario_fim.split(':').map(Number)
    const agInicioMinutos = agInicioHora * 60 + agInicioMin
    const agFimMinutos = agFimHora * 60 + agFimMin

    // Verifica se há QUALQUER sobreposição
    return (
      (agInicioMinutos < fimMinutos && agFimMinutos > inicioMinutos)
    )
  })
}

// Verificar se uma data tem horários disponíveis (considerando agendamentos existentes)
export async function diaTemHorariosDisponiveis(date, duracaoServico, agendamentosOcupados) {
  const todosHorarios = gerarHorariosDisponiveis(date, duracaoServico)
  
  if (todosHorarios.length === 0) {
    return false
  }

  // Filtrar horários que não estão ocupados
  const horariosLivres = todosHorarios.filter(slot => {
    const isOcupado = agendamentosOcupados.some(ag => {
      return ag.horario_inicio === slot.inicio
    })
    return !isOcupado
  })

  return horariosLivres.length > 0
}

// Verificar se a data é no passado
export function isDataPassado(date) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const dataAgendamento = new Date(date + 'T00:00:00')
  return dataAgendamento < hoje
}

// Formatar data para exibição
export function formatarData(date) {
  const data = new Date(date + 'T00:00:00')
  return data.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Formatar data curta
export function formatarDataCurta(date) {
  const data = new Date(date + 'T00:00:00')
  return data.toLocaleDateString('pt-BR')
}

// Formatar horário
export function formatarHorario(horario) {
  return horario
}

// Obter nome do dia da semana
export function getNomeDiaSemana(date) {
  const data = new Date(date + 'T00:00:00')
  return data.toLocaleDateString('pt-BR', { weekday: 'long' })
}

// Capitalizar primeira letra
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Formatar valor monetário
export function formatarValor(valor) {
  return `R$ ${valor.toFixed(2).replace('.', ',')}`
}

// Obter cor do status
export function getCorStatus(status) {
  const cores = {
    ativo: 'var(--success)',
    cancelado: 'var(--error)',
    concluido: 'var(--primary-gold)'
  }
  return cores[status] || 'var(--text-secondary)'
}

// Validar email
export function validarEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Validar senha (mínimo 6 caracteres)
export function validarSenha(senha) {
  return senha.length >= 6
}

// Gerar ID único
export function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
