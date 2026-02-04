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
        <div class="container" style="padding-top: clamp(20px, 5vw, 40px); padding-bottom: clamp(20px, 5vw, 40px);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; flex-wrap: wrap; gap: 16px;">
            <h1 style="font-size: clamp(24px, 6vw, 32px); color: var(--primary-gold); margin: 0;">Meus Agendamentos</h1>
            <a href="#/agendar" class="btn btn-primary" style="font-size: clamp(13px, 3vw, 14px); white-space: nowrap;">
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
        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary" style="flex: 1;" data-id="${agendamento.id}" data-action="editar">
            ✏️ Editar
          </button>
          <button class="btn btn-danger" style="flex: 1;" data-id="${agendamento.id}" data-action="cancelar">
            🚫 Cancelar
          </button>
        </div>
      ` : ''}
    `

    if (isProximo && agendamento.status === 'ativo') {
      const editarBtn = card.querySelector('button[data-action="editar"]')
      const cancelarBtn = card.querySelector('button[data-action="cancelar"]')
      
      editarBtn?.addEventListener('click', () => {
        this.mostrarModalEditar(agendamento)
      })
      
      cancelarBtn?.addEventListener('click', () => {
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

  mostrarModalEditar(agendamento) {
    const modal = new Modal(
      'Editar Agendamento',
      `
        <form id="formEditarAgendamento" style="display: flex; flex-direction: column; gap: 16px;">
          <div class="card" style="background: var(--background-dark); margin-bottom: 16px;">
            <div style="font-weight: 600; margin-bottom: 8px;">${agendamento.servico}</div>
            <div style="color: var(--text-secondary); font-size: 14px;">
              ${capitalize(formatarData(agendamento.data))} • ${agendamento.horario_inicio} - ${agendamento.horario_fim}
            </div>
          </div>

          <div class="input-group">
            <label>Observações</label>
            <textarea 
              id="observacoesEdit" 
              rows="4" 
              placeholder="Adicione ou edite observações sobre o agendamento..."
            >${agendamento.observacoes_cliente || ''}</textarea>
            <small style="color: var(--text-muted); margin-top: 4px;">
              Use este campo para informar preferências, detalhes ou pedidos especiais.
            </small>
          </div>

          <div class="alert" style="background: var(--warning)20; color: var(--warning); padding: 12px; border-radius: 8px; font-size: 14px;">
            ℹ️ Para alterar data ou horário, cancele este agendamento e crie um novo.
          </div>

          <div style="display: flex; gap: 12px; margin-top: 16px;">
            <button type="button" class="btn btn-secondary" id="modalCancelEditBtn" style="flex: 1;">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" style="flex: 1;">
              💾 Salvar
            </button>
          </div>
        </form>
      `,
      null
    )

    modal.render()

    document.getElementById('modalCancelEditBtn').addEventListener('click', () => {
      modal.close()
    })

    document.getElementById('formEditarAgendamento').addEventListener('submit', async (e) => {
      e.preventDefault()
      
      const observacoes = document.getElementById('observacoesEdit').value.trim()
      const submitBtn = e.target.querySelector('button[type="submit"]')
      
      submitBtn.disabled = true
      submitBtn.textContent = 'Salvando...'

      const { error } = await agendamentoService.update(agendamento.id, {
        observacoes_cliente: observacoes || null
      })

      if (error) {
        alert('❌ Erro ao atualizar. Tente novamente.')
        submitBtn.disabled = false
        submitBtn.textContent = '💾 Salvar'
        return
      }

      alert('✅ Agendamento atualizado!')
      modal.close()
      this.render()
    })
  }
}
