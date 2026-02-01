import { agendamentoService } from '../services/agendamento.js'
import { formatarData, formatarValor, getCorStatus, capitalize } from '../utils/helpers.js'
import { Modal } from '../components/Modal.js'

export class MeusAgendamentosPage {
  constructor(container, user) {
    this.container = container
    this.user = user
    this.agendamentos = []
    this.showSuccess = window.location.hash.includes('success=true')
  }

  async render() {
    this.container.innerHTML = `
      <div class="main-content">
        <div class="container" style="padding-top: 40px; padding-bottom: 40px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; flex-wrap: wrap; gap: 16px;">
            <h1 style="font-size: 32px; color: var(--primary-gold);">Meus Agendamentos</h1>
            <a href="#/agendar" class="btn btn-primary">
              + Novo Agendamento
            </a>
          </div>

          ${this.showSuccess ? `
            <div class="alert alert-success" style="margin-bottom: 24px;">
              ✅ Agendamento realizado com sucesso!
            </div>
          ` : ''}

          <div id="agendamentosContainer">
            <div class="loading">
              <div class="spinner"></div>
              <p>Carregando agendamentos...</p>
            </div>
          </div>
        </div>
      </div>
    `

    await this.carregarAgendamentos()
  }

  async carregarAgendamentos() {
    const container = document.getElementById('agendamentosContainer')
    
    const { data, error } = await agendamentoService.getByUser(this.user.id)

    if (error) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-title">Erro ao carregar</div>
          <div class="empty-state-text">Tente novamente mais tarde</div>
        </div>
      `
      return
    }

    this.agendamentos = data || []

    // Separar por status e data
    const proximos = this.agendamentos
      .filter(ag => ag.status === 'ativo' && new Date(ag.data + 'T00:00:00') >= new Date())
      .sort((a, b) => {
        const dataA = new Date(a.data + 'T' + a.horario_inicio)
        const dataB = new Date(b.data + 'T' + b.horario_inicio)
        return dataA - dataB
      })

    const historico = this.agendamentos
      .filter(ag => ag.status !== 'ativo' || new Date(ag.data + 'T00:00:00') < new Date())
      .sort((a, b) => {
        const dataA = new Date(a.data + 'T' + a.horario_inicio)
        const dataB = new Date(b.data + 'T' + b.horario_inicio)
        return dataB - dataA
      })

    if (this.agendamentos.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📅</div>
          <div class="empty-state-title">Nenhum agendamento</div>
          <div class="empty-state-text">Você ainda não tem agendamentos. Clique no botão acima para criar seu primeiro agendamento.</div>
        </div>
      `
      return
    }

    container.innerHTML = `
      ${proximos.length > 0 ? `
        <div style="margin-bottom: 40px;">
          <h2 style="margin-bottom: 20px; color: var(--primary-gold);">Próximos Agendamentos</h2>
          <div class="grid" id="proximosGrid"></div>
        </div>
      ` : ''}

      ${historico.length > 0 ? `
        <div>
          <h2 style="margin-bottom: 20px;">Histórico</h2>
          <div class="grid" id="historicoGrid"></div>
        </div>
      ` : ''}
    `

    if (proximos.length > 0) {
      const proximosGrid = document.getElementById('proximosGrid')
      proximos.forEach(ag => this.renderAgendamento(proximosGrid, ag, true))
    }

    if (historico.length > 0) {
      const historicoGrid = document.getElementById('historicoGrid')
      historico.forEach(ag => this.renderAgendamento(historicoGrid, ag, false))
    }
  }

  renderAgendamento(container, agendamento, isProximo) {
    const card = document.createElement('div')
    card.className = 'card'
    card.style.position = 'relative'
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
        <div>
          <div style="font-size: 20px; font-weight: 600; color: var(--primary-gold); margin-bottom: 4px;">
            ${agendamento.servico}
          </div>
          <div style="color: var(--text-secondary); font-size: 14px;">
            ${capitalize(formatarData(agendamento.data))}
          </div>
        </div>
        <div style="padding: 4px 12px; border-radius: 6px; background: ${getCorStatus(agendamento.status)}20; color: ${getCorStatus(agendamento.status)}; font-size: 12px; font-weight: 600;">
          ${agendamento.status === 'ativo' ? 'Ativo' : agendamento.status === 'cancelado' ? 'Cancelado' : 'Concluído'}
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 8px; color: var(--text-secondary);">
          <span>🕐</span>
          <span>${agendamento.horario_inicio} - ${agendamento.horario_fim}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; color: var(--text-secondary);">
          <span>💰</span>
          <span>${formatarValor(agendamento.valor)}</span>
        </div>
        ${agendamento.observacoes_cliente ? `
          <div style="display: flex; align-items: start; gap: 8px; color: var(--text-secondary); margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-color);">
            <span>📝</span>
            <span style="flex: 1;">${agendamento.observacoes_cliente}</span>
          </div>
        ` : ''}
      </div>

      ${isProximo && agendamento.status === 'ativo' ? `
        <button class="btn btn-danger" style="width: 100%;" data-id="${agendamento.id}">
          Cancelar Agendamento
        </button>
      ` : ''}
    `

    if (isProximo && agendamento.status === 'ativo') {
      const cancelBtn = card.querySelector('button[data-id]')
      cancelBtn.addEventListener('click', () => {
        this.confirmarCancelamento(agendamento)
      })
    }

    container.appendChild(card)
  }

  confirmarCancelamento(agendamento) {
    const modal = new Modal(
      'Cancelar Agendamento',
      `
        <p style="margin-bottom: 24px; color: var(--text-secondary);">
          Tem certeza que deseja cancelar este agendamento?
        </p>
        <div class="card" style="margin-bottom: 24px; background: var(--background-dark);">
          <div style="font-weight: 600; margin-bottom: 8px;">${agendamento.servico}</div>
          <div style="color: var(--text-secondary); font-size: 14px;">
            ${capitalize(formatarData(agendamento.data))} às ${agendamento.horario_inicio}
          </div>
        </div>
        <p style="margin-bottom: 24px; color: var(--error); font-size: 14px;">
          Esta ação não pode ser desfeita.
        </p>
        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary" id="modalCancelBtn" style="flex: 1;">
            Não, manter
          </button>
          <button class="btn btn-danger" id="modalConfirmBtn" style="flex: 1;">
            Sim, cancelar
          </button>
        </div>
      `,
      null
    )

    modal.render()

    document.getElementById('modalCancelBtn').addEventListener('click', () => {
      modal.close()
    })

    document.getElementById('modalConfirmBtn').addEventListener('click', async () => {
      const confirmBtn = document.getElementById('modalConfirmBtn')
      confirmBtn.disabled = true
      confirmBtn.textContent = 'Cancelando...'

      const { error } = await agendamentoService.cancel(agendamento.id)

      if (error) {
        alert('Erro ao cancelar agendamento. Tente novamente.')
        confirmBtn.disabled = false
        confirmBtn.textContent = 'Sim, cancelar'
        return
      }

      modal.close()
      this.render()
    })
  }
}
