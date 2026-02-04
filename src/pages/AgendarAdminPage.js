import { Calendar } from '../components/Calendar.js'
import { agendamentoService } from '../services/agendamento.js'
import { bloqueioService } from '../services/bloqueio.js'
import { SERVICOS, gerarHorariosDisponiveis, formatarData, formatarValor, getNomeDiaSemana } from '../utils/helpers.js'
import { Modal } from '../components/Modal.js'

export class AgendarAdminPage {
  constructor(container, user) {
    this.container = container
    this.user = user
    this.dataSelecionada = null
    this.agendamentosDoDia = []
    this.bloqueiosDoDia = []
  }

  async render() {
    this.container.innerHTML = `
      <div class="main-content">
        <div class="container" style="padding-top: 40px; padding-bottom: 40px;">
          <h1 style="font-size: clamp(24px, 5vw, 32px); margin-bottom: 32px; color: var(--primary-gold);">Agendar (Admin)</h1>
          
          <div class="grid grid-2" style="gap: 24px; align-items: start;">
            <div class="card">
              <h2 style="margin-bottom: 24px; font-size: 20px;">Escolha o Dia</h2>
              <div id="calendar"></div>
            </div>

            <div class="card" id="diaInfo" style="min-height: 400px;">
              <div class="empty-state">
                <div class="empty-state-icon">📅</div>
                <div class="empty-state-title">Selecione um dia</div>
                <div class="empty-state-text">Clique em uma data no calendário</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `

    this.renderCalendar()
  }

  renderCalendar() {
    const calendarContainer = document.getElementById('calendar')
    const calendar = new Calendar(calendarContainer, async (date) => {
      this.dataSelecionada = date
      await this.carregarDadosDoDia(date)
      this.renderDiaInfo()
    })
    calendar.render()
  }

  async carregarDadosDoDia(data) {
    try {
      const [agendamentosResult, bloqueiosResult] = await Promise.all([
        agendamentoService.getByDate(data),
        bloqueioService.getByDate(data)
      ])

      this.agendamentosDoDia = agendamentosResult.data || []
      this.bloqueiosDoDia = bloqueiosResult.data || []
    } catch (error) {
      console.error('Erro ao carregar dados do dia:', error)
      this.agendamentosDoDia = []
      this.bloqueiosDoDia = []
    }
  }

  renderDiaInfo() {
    const container = document.getElementById('diaInfo')
    
    if (!this.dataSelecionada) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📅</div>
          <div class="empty-state-title">Selecione um dia</div>
        </div>
      `
      return
    }

    const diaSemana = getNomeDiaSemana(this.dataSelecionada)
    const agendamentosAtivos = this.agendamentosDoDia.filter(ag => ag.status !== 'cancelado')

    container.innerHTML = `
      <div>
        <h2 style="margin-bottom: 8px; font-size: 20px;">${formatarData(this.dataSelecionada)}</h2>
        <p style="color: var(--text-secondary); margin-bottom: 24px; font-size: 14px;">${diaSemana}</p>

        ${agendamentosAtivos.length > 0 ? `
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 16px; margin-bottom: 12px; color: var(--primary-gold);">
              📋 Agendamentos (${agendamentosAtivos.length})
            </h3>
            <div style="display: grid; gap: 12px;">
              ${agendamentosAtivos.map(ag => this.renderAgendamentoItem(ag)).join('')}
            </div>
          </div>
        ` : `
          <div style="padding: 16px; background: var(--background-dark); border-radius: 8px; margin-bottom: 24px; text-align: center; color: var(--text-secondary); font-size: 14px;">
            Nenhum agendamento neste dia
          </div>
        `}

        <button class="btn btn-primary" id="btnNovoAgendamento" style="width: 100%;">
          ➕ Novo Agendamento
        </button>
      </div>
    `

    document.getElementById('btnNovoAgendamento')?.addEventListener('click', () => {
      this.mostrarModalNovoAgendamento()
    })
  }

  renderAgendamentoItem(ag) {
    return `
      <div style="padding: 12px; background: var(--background-card); border-radius: 8px; border-left: 3px solid var(--primary-gold);">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 15px; margin-bottom: 4px;">
              ${ag.horario_inicio} - ${ag.horario_fim}
            </div>
            <div style="font-size: 13px; color: var(--text-secondary);">
              ${ag.users?.nome || ag.nome_cliente}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 600; color: var(--primary-gold); font-size: 15px;">
              ${formatarValor(ag.valor)}
            </div>
            <div style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: ${ag.status === 'ativo' ? 'var(--success)' : 'var(--text-secondary)'}20; color: ${ag.status === 'ativo' ? 'var(--success)' : 'var(--text-secondary)'}; margin-top: 4px;">
              ${ag.status}
            </div>
          </div>
        </div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 4px;">
          ${ag.servico}
        </div>
        ${ag.observacoes_cliente ? `
          <div style="margin-top: 8px; padding: 8px; background: var(--background-dark); border-radius: 6px; font-size: 13px; color: var(--text-secondary);">
            <span style="font-weight: 600; color: var(--text-primary);">💬 Observações:</span><br>
            ${ag.observacoes_cliente}
          </div>
        ` : ''}
      </div>
    `
  }

  mostrarModalNovoAgendamento() {
    const modal = new Modal(
      'Novo Agendamento',
      `
        <form id="formNovoAgendamento" style="display: flex; flex-direction: column; gap: 16px;">
          <div class="input-group">
            <label>Nome do Cliente</label>
            <input type="text" id="nomeCliente" required placeholder="Digite o nome do cliente">
          </div>

          <div class="input-group">
            <label>Serviço</label>
            <select id="servico" required>
              <option value="">Selecione um serviço</option>
              ${SERVICOS.map(s => `
                <option value="${s.nome}" data-duracao="${s.duracao}" data-valor="${s.valor}">
                  ${s.nome} - ${s.duracao}min - ${formatarValor(s.valor)}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="input-group">
            <label>Horário</label>
            <select id="horario" required disabled>
              <option value="">Selecione um serviço primeiro</option>
            </select>
          </div>

          <div class="input-group">
            <label>Observações (opcional)</label>
            <textarea id="observacoes" rows="3" placeholder="Observações sobre o agendamento..."></textarea>
          </div>

          <div style="display: flex; gap: 12px; margin-top: 16px;">
            <button type="button" class="btn btn-secondary" id="cancelarBtn">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" style="flex: 1;">
              ✅ Confirmar
            </button>
          </div>
        </form>
      `,
      null
    )

    modal.render()

    document.getElementById('servico').addEventListener('change', (e) => {
      const select = e.target
      const option = select.options[select.selectedIndex]
      
      if (option.value) {
        const duracao = parseInt(option.dataset.duracao)
        this.carregarHorariosDisponiveis(duracao)
      } else {
        document.getElementById('horario').innerHTML = '<option value="">Selecione um serviço primeiro</option>'
        document.getElementById('horario').disabled = true
      }
    })

    document.getElementById('formNovoAgendamento').addEventListener('submit', async (e) => {
      e.preventDefault()
      await this.criarNovoAgendamento(modal)
    })

    document.getElementById('cancelarBtn').addEventListener('click', () => {
      modal.close()
    })
  }

  async carregarHorariosDisponiveis(duracao) {
    const horarioSelect = document.getElementById('horario')
    
    const horariosLivres = gerarHorariosDisponiveis(
      this.dataSelecionada,
      duracao,
      this.bloqueiosDoDia,
      this.agendamentosDoDia
    )

    if (horariosLivres.length === 0) {
      horarioSelect.innerHTML = '<option value="">Sem horários disponíveis</option>'
      horarioSelect.disabled = true
      return
    }

    horarioSelect.disabled = false
    horarioSelect.innerHTML = `
      <option value="">Escolha um horário</option>
      ${horariosLivres.map(slot => `
        <option value="${slot.inicio}|${slot.fim}">
          ${slot.inicio} - ${slot.fim}
        </option>
      `).join('')}
    `
  }

  async criarNovoAgendamento(modal) {
    const nomeCliente = document.getElementById('nomeCliente').value
    const servicoSelect = document.getElementById('servico')
    const servicoOption = servicoSelect.options[servicoSelect.selectedIndex]
    const horarioSelect = document.getElementById('horario').value
    const observacoes = document.getElementById('observacoes').value

    if (!horarioSelect) {
      alert('⚠️ Selecione um horário!')
      return
    }

    const [horarioInicio, horarioFim] = horarioSelect.split('|')

    const agendamento = {
      user_id: this.user.id,
      nome_cliente: nomeCliente,
      data: this.dataSelecionada,
      horario_inicio: horarioInicio,
      horario_fim: horarioFim,
      servico: servicoOption.value,
      valor: parseFloat(servicoOption.dataset.valor),
      observacoes_cliente: observacoes || null
    }

    const { error } = await agendamentoService.create(agendamento)

    if (error) {
      alert('❌ Erro ao criar agendamento: ' + error.message)
      return
    }

    alert('✅ Agendamento criado com sucesso!')
    modal.close()
    
    await this.carregarDadosDoDia(this.dataSelecionada)
    this.renderDiaInfo()
  }
}
