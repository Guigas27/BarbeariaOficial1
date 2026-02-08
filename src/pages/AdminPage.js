import { agendamentoService } from '../services/agendamento.js'
import { formatarData, formatarValor, formatarDataCurta, getCorStatus, capitalize, getNomeDiaSemana } from '../utils/helpers.js'
import { Modal } from '../components/Modal.js'

export class AdminPage {
  constructor(container, user) {
    this.container = container
    this.user = user
    this.currentDate = new Date()
    this.agendamentos = []
    this.view = 'calendar' // 'calendar' ou 'list'
  }

  async render() {
    this.container.innerHTML = `
      <div class="main-content">
        <div class="container" style="padding-top: 40px; padding-bottom: 40px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; flex-wrap: wrap; gap: 16px;">
            <h1 style="font-size: clamp(24px, 6vw, 32px); color: var(--primary-gold); margin: 0;">Área do Barbeiro</h1>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; width: 100%; max-width: 300px;">
              <button class="btn ${this.view === 'calendar' ? 'btn-primary' : 'btn-secondary'}" id="viewCalendarBtn" style="flex: 1; min-width: 120px; font-size: clamp(13px, 3vw, 14px);">
                📅 Calendário
              </button>
              <button class="btn ${this.view === 'list' ? 'btn-primary' : 'btn-secondary'}" id="viewListBtn" style="flex: 1; min-width: 120px; font-size: clamp(13px, 3vw, 14px);">
                📋 Lista
              </button>
            </div>
          </div>

          <div id="statsContainer" style="margin-bottom: 32px;"></div>
          <div id="contentContainer"></div>
        </div>
      </div>
    `

    document.getElementById('viewCalendarBtn').addEventListener('click', () => {
      this.view = 'calendar'
      this.render()
    })

    document.getElementById('viewListBtn').addEventListener('click', () => {
      this.view = 'list'
      this.render()
    })

    await this.carregarDados()
  }

  async carregarDados() {
    const year = this.currentDate.getFullYear()
    const month = this.currentDate.getMonth() + 1

    console.log('Carregando dados para:', year, month)

    const { data, error } = await agendamentoService.getByMonth(year, month)

    if (error) {
      console.error('Erro ao carregar agendamentos:', error)
      
      // Verificar se é erro de autenticação
      if (error.message && error.message.includes('Auth')) {
        document.getElementById('contentContainer').innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🔒</div>
            <div class="empty-state-title">Sessão expirada</div>
            <div class="empty-state-text">
              Sua sessão expirou. Por favor, faça login novamente.
              <br><br>
              <a href="#/login" class="btn btn-primary">Fazer Login</a>
            </div>
          </div>
        `
        return
      }
      
      document.getElementById('contentContainer').innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-title">Erro ao carregar</div>
          <div class="empty-state-text">
            ${error.message || 'Tente novamente mais tarde'}
            <br><br>
            <button class="btn btn-primary" onclick="location.reload()">Tentar Novamente</button>
          </div>
        </div>
      `
      return
    }

    console.log('Agendamentos carregados:', data)

    this.agendamentos = data || []
    this.renderStats()
    
    if (this.view === 'calendar') {
      this.renderCalendarView()
    } else {
      this.renderListView()
    }
  }

  renderStats() {
    const container = document.getElementById('statsContainer')
    
    if (!container) {
      console.error('Container de estatísticas não encontrado')
      return
    }
    
    const ativos = this.agendamentos.filter(ag => ag.status === 'ativo').length
    const concluidos = this.agendamentos.filter(ag => ag.status === 'concluido').length
    const totalFaturamento = this.agendamentos
      .filter(ag => ag.status === 'ativo' || ag.status === 'concluido')
      .reduce((sum, ag) => sum + ag.valor, 0)

    container.innerHTML = `
      <div class="grid grid-3">
        <div class="card" style="text-align: center;">
          <div style="font-size: clamp(28px, 6vw, 36px); margin-bottom: 8px;">📊</div>
          <div style="font-size: clamp(24px, 6vw, 32px); font-weight: 700; color: var(--primary-gold); margin-bottom: 4px;">
            ${ativos}
          </div>
          <div style="color: var(--text-secondary); font-size: clamp(12px, 3vw, 14px);">Agendamentos Ativos</div>
        </div>

        <div class="card" style="text-align: center;">
          <div style="font-size: clamp(28px, 6vw, 36px); margin-bottom: 8px;">✅</div>
          <div style="font-size: clamp(24px, 6vw, 32px); font-weight: 700; color: var(--success); margin-bottom: 4px;">
            ${concluidos}
          </div>
          <div style="color: var(--text-secondary); font-size: clamp(12px, 3vw, 14px);">Concluídos</div>
        </div>

        <div class="card" style="text-align: center;">
          <div style="font-size: clamp(28px, 6vw, 36px); margin-bottom: 8px;">💰</div>
          <div style="font-size: clamp(20px, 5vw, 28px); font-weight: 700; color: var(--primary-gold); margin-bottom: 4px;">
            ${formatarValor(totalFaturamento)}
          </div>
          <div style="color: var(--text-secondary); font-size: clamp(12px, 3vw, 14px);">Receita do Mês</div>
        </div>
      </div>
    `
  }

  renderCalendarView() {
    const container = document.getElementById('contentContainer')
    const year = this.currentDate.getFullYear()
    const month = this.currentDate.getMonth()

    container.innerHTML = `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-secondary" id="prevMonth" style="flex: 1; min-width: 100px; font-size: clamp(12px, 2.5vw, 14px); padding: 8px 12px;">◀ Anterior</button>
          <h2 style="font-size: clamp(18px, 4vw, 24px); margin: 0;">${this.getMonthName(month)} ${year}</h2>
          <button class="btn btn-secondary" id="nextMonth" style="flex: 1; min-width: 100px; font-size: clamp(12px, 2.5vw, 14px); padding: 8px 12px;">Próximo ▶</button>
        </div>
        <div id="agendamentosDoMes"></div>
      </div>
    `

    document.getElementById('prevMonth').addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1)
      this.render()
    })

    document.getElementById('nextMonth').addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1)
      this.render()
    })

    this.renderAgendamentosPorDia()
  }

  renderAgendamentosPorDia() {
    const container = document.getElementById('agendamentosDoMes')
    
    // Agrupar por data
    const porData = {}
    this.agendamentos.forEach(ag => {
      if (!porData[ag.data]) {
        porData[ag.data] = []
      }
      porData[ag.data].push(ag)
    })

    // Ordenar datas
    const datas = Object.keys(porData).sort()

    if (datas.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📅</div>
          <div class="empty-state-title">Nenhum agendamento</div>
          <div class="empty-state-text">Não há agendamentos neste mês</div>
        </div>
      `
      return
    }

    container.innerHTML = datas.map(data => {
      const agendamentos = porData[data].sort((a, b) => a.horario_inicio.localeCompare(b.horario_inicio))
      const diaSemana = getNomeDiaSemana(data)
      const total = agendamentos.length
      
      return `
        <div style="margin-bottom: 32px; border-left: 4px solid var(--primary-gold); padding-left: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
            <h3 style="font-size: clamp(16px, 4vw, 18px); color: var(--primary-gold); margin: 0;">
              ${formatarData(data)} - ${capitalize(diaSemana)}
            </h3>
            <span style="font-size: 14px; color: var(--text-secondary); background: var(--background-card-hover); padding: 4px 12px; border-radius: 12px;">
              ${total} agendamento${total !== 1 ? 's' : ''}
            </span>
          </div>
          <div class="grid">
            ${agendamentos.map(ag => this.renderAgendamentoCard(ag)).join('')}
          </div>
        </div>
      `
    }).join('')

    this.setupEventListeners()
  }

  setupEventListeners() {
    // Botões de editar
    document.querySelectorAll('[data-edit-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-edit-id'))
        const agendamento = this.agendamentos.find(ag => ag.id === id)
        if (agendamento) {
          this.editarAgendamento(agendamento)
        }
      })
    })

    // Botões de cancelar
    document.querySelectorAll('[data-cancel-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-cancel-id'))
        const agendamento = this.agendamentos.find(ag => ag.id === id)
        if (agendamento) {
          this.cancelarAgendamento(agendamento)
        }
      })
    })

    // Botões de concluir
    document.querySelectorAll('[data-complete-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-complete-id'))
        const agendamento = this.agendamentos.find(ag => ag.id === id)
        if (agendamento) {
          this.concluirAgendamento(agendamento)
        }
      })
    })

    // Botões de ver detalhes
    document.querySelectorAll('[data-view-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-view-id'))
        const agendamento = this.agendamentos.find(ag => ag.id === id)
        if (agendamento) {
          this.verAgendamento(agendamento)
        }
      })
    })
  }

  renderListView() {
    const container = document.getElementById('contentContainer')
    const year = this.currentDate.getFullYear()
    const month = this.currentDate.getMonth()

    container.innerHTML = `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-secondary" id="prevMonth" style="flex: 1; min-width: 100px; font-size: clamp(12px, 2.5vw, 14px); padding: 8px 12px;">◀ Anterior</button>
          <h2 style="font-size: clamp(18px, 4vw, 24px); margin: 0;">${this.getMonthName(month)} ${year}</h2>
          <button class="btn btn-secondary" id="nextMonth" style="flex: 1; min-width: 100px; font-size: clamp(12px, 2.5vw, 14px); padding: 8px 12px;">Próximo ▶</button>
        </div>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; min-width: 600px;">
            <thead>
              <tr style="border-bottom: 2px solid var(--border-color);">
                <th style="padding: 12px; text-align: left; color: var(--text-secondary); font-size: clamp(12px, 2.5vw, 14px);">Data</th>
                <th style="padding: 12px; text-align: left; color: var(--text-secondary); font-size: clamp(12px, 2.5vw, 14px);">Horário</th>
                <th style="padding: 12px; text-align: left; color: var(--text-secondary); font-size: clamp(12px, 2.5vw, 14px);">Cliente</th>
                <th style="padding: 12px; text-align: left; color: var(--text-secondary); font-size: clamp(12px, 2.5vw, 14px);">Serviço</th>
                <th style="padding: 12px; text-align: left; color: var(--text-secondary); font-size: clamp(12px, 2.5vw, 14px);">Valor</th>
                <th style="padding: 12px; text-align: left; color: var(--text-secondary); font-size: clamp(12px, 2.5vw, 14px);">Status</th>
                <th style="padding: 12px; text-align: center; color: var(--text-secondary); font-size: clamp(12px, 2.5vw, 14px);">Ações</th>
              </tr>
            </thead>
            <tbody id="agendamentosTable">
            </tbody>
          </table>
        </div>
      </div>
    `

    document.getElementById('prevMonth').addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1)
      this.render()
    })

    document.getElementById('nextMonth').addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1)
      this.render()
    })

    const tbody = document.getElementById('agendamentosTable')
    
    if (this.agendamentos.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="padding: 40px; text-align: center; color: var(--text-secondary);">
            Nenhum agendamento neste mês
          </td>
        </tr>
      `
      return
    }

    this.agendamentos.sort((a, b) => {
      const dataA = new Date(a.data + 'T' + a.horario_inicio)
      const dataB = new Date(b.data + 'T' + b.horario_inicio)
      return dataA - dataB
    })

    tbody.innerHTML = this.agendamentos.map(ag => `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td style="padding: 12px;">${formatarDataCurta(ag.data)}</td>
        <td style="padding: 12px;">${ag.horario_inicio}</td>
        <td style="padding: 12px;">${ag.users?.nome || ag.nome_cliente}</td>
        <td style="padding: 12px;">${ag.servico}</td>
        <td style="padding: 12px; font-weight: 600;">${formatarValor(ag.valor)}</td>
        <td style="padding: 12px;">
          <span style="padding: 4px 8px; border-radius: 4px; background: ${getCorStatus(ag.status)}20; color: ${getCorStatus(ag.status)}; font-size: 12px;">
            ${ag.status}
          </span>
        </td>
        <td style="padding: 12px; text-align: center;">
          <button class="btn btn-secondary" data-view-id="${ag.id}" style="padding: 6px 12px; font-size: 14px;">
            Ver
          </button>
        </td>
      </tr>
    `).join('')

    // Adicionar event listeners
    this.agendamentos.forEach(ag => {
      const viewBtn = document.querySelector(`[data-view-id="${ag.id}"]`)
      if (viewBtn) {
        viewBtn.addEventListener('click', () => this.verAgendamento(ag))
      }
    })
  }

  renderAgendamentoCard(ag) {
    // Obter nome do cliente (seja do relacionamento users ou do campo nome_cliente)
    const nomeCliente = ag.users?.nome || ag.nome_cliente || 'Cliente'
    
    return `
      <div class="card" style="position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
          <div>
            <div style="font-weight: 600; color: var(--primary-gold);">
              ${ag.horario_inicio} - ${ag.horario_fim}
            </div>
            <div style="color: var(--text-secondary); font-size: 14px;">
              ${nomeCliente}
            </div>
          </div>
          <div style="padding: 4px 8px; border-radius: 4px; background: ${getCorStatus(ag.status)}20; color: ${getCorStatus(ag.status)}; font-size: 12px;">
            ${ag.status}
          </div>
        </div>

        <div style="margin-bottom: 12px;">
          <div style="color: var(--text-primary);">${ag.servico}</div>
          <div style="color: var(--primary-gold); font-weight: 600;">${formatarValor(ag.valor)}</div>
        </div>

        ${ag.observacoes_cliente ? `
          <div style="padding: 8px; background: var(--background-dark); border-radius: 6px; margin-bottom: 12px; font-size: 14px; color: var(--text-secondary);">
            📝 ${ag.observacoes_cliente}
          </div>
        ` : ''}

        ${ag.status === 'ativo' ? `
          <div style="display: flex; gap: 8px; font-size: 14px;">
            <button class="btn btn-secondary" data-edit-id="${ag.id}" style="flex: 1; padding: 8px;">
              Editar
            </button>
            <button class="btn btn-primary" data-complete-id="${ag.id}" style="flex: 1; padding: 8px;">
              Concluir
            </button>
            <button class="btn btn-danger" data-cancel-id="${ag.id}" style="padding: 8px;">
              ✕
            </button>
          </div>
        ` : ''}
      </div>
    `
  }

  verAgendamento(ag) {
    const nomeCliente = ag.users?.nome || ag.nome_cliente || 'Cliente'
    const emailCliente = ag.users?.email || 'N/A'
    
    const modal = new Modal(
      'Detalhes do Agendamento',
      `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-secondary);">Cliente:</span>
            <span style="font-weight: 600;">${nomeCliente}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-secondary);">Email:</span>
            <span>${emailCliente}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-secondary);">Data:</span>
            <span style="font-weight: 600;">${formatarDataCurta(ag.data)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-secondary);">Horário:</span>
            <span style="font-weight: 600;">${ag.horario_inicio} - ${ag.horario_fim}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-secondary);">Serviço:</span>
            <span style="font-weight: 600;">${ag.servico}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-secondary);">Valor:</span>
            <span style="font-weight: 700; color: var(--primary-gold);">${formatarValor(ag.valor)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-secondary);">Status:</span>
            <span style="padding: 4px 12px; border-radius: 6px; background: ${getCorStatus(ag.status)}20; color: ${getCorStatus(ag.status)};">
              ${ag.status}
            </span>
          </div>
          ${ag.observacoes_cliente ? `
            <div style="padding-top: 16px; border-top: 1px solid var(--border-color);">
              <div style="color: var(--text-secondary); margin-bottom: 8px;">Observações:</div>
              <div style="padding: 12px; background: var(--background-dark); border-radius: 6px;">
                ${ag.observacoes_cliente}
              </div>
            </div>
          ` : ''}
        </div>

        ${ag.status === 'ativo' ? `
          <div style="display: flex; gap: 12px; margin-top: 24px;">
            <button class="btn btn-primary" id="modalCompleteBtn" style="flex: 1;">
              Marcar como Concluído
            </button>
            <button class="btn btn-danger" id="modalCancelBtn">
              Cancelar
            </button>
          </div>
        ` : ''}
      `,
      null
    )

    modal.render()

    if (ag.status === 'ativo') {
      document.getElementById('modalCompleteBtn')?.addEventListener('click', async () => {
        modal.close()
        await this.concluirAgendamento(ag)
      })

      document.getElementById('modalCancelBtn')?.addEventListener('click', async () => {
        modal.close()
        await this.cancelarAgendamento(ag)
      })
    }
  }

  async concluirAgendamento(ag) {
    if (!confirm('Marcar este agendamento como concluído?')) return

    const { error } = await agendamentoService.update(ag.id, { status: 'concluido' })

    if (error) {
      alert('Erro ao concluir agendamento')
      return
    }

    this.render()
  }

  async cancelarAgendamento(ag) {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return

    if (!ag || !ag.id) {
      alert('❌ Erro: Agendamento inválido')
      return
    }

    const { error } = await agendamentoService.cancel(ag.id)

    if (error) {
      console.error('Erro ao cancelar:', error)
      alert(`❌ Erro ao cancelar agendamento: ${error.message || 'Tente novamente'}`)
      return
    }

    alert('✅ Agendamento cancelado com sucesso!')
    this.render()
  }

  async editarAgendamento(ag) {
    const modal = new Modal(
      'Editar Agendamento',
      `
        <form id="editForm" style="display: flex; flex-direction: column; gap: 16px;">
          <div class="input-group">
            <label>Cliente</label>
            <input type="text" id="editNomeCliente" value="${ag.nome_cliente}" required>
          </div>

          <div class="input-group">
            <label>Data</label>
            <input type="date" id="editData" value="${ag.data}" required>
          </div>

          <div class="grid grid-2" style="gap: 16px;">
            <div class="input-group">
              <label>Horário Início</label>
              <input type="time" id="editHorarioInicio" value="${ag.horario_inicio}" required>
            </div>

            <div class="input-group">
              <label>Horário Fim</label>
              <input type="time" id="editHorarioFim" value="${ag.horario_fim}" required>
            </div>
          </div>

          <div class="input-group">
            <label>Serviço</label>
            <select id="editServico" required>
              <option value="Cabelo" ${ag.servico === 'Cabelo' ? 'selected' : ''}>Cabelo - R$ 35,00</option>
              <option value="Barba" ${ag.servico === 'Barba' ? 'selected' : ''}>Barba - R$ 30,00</option>
              <option value="Cabelo + Barba" ${ag.servico === 'Cabelo + Barba' ? 'selected' : ''}>Cabelo + Barba - R$ 60,00</option>
              <option value="Luzes" ${ag.servico === 'Luzes' ? 'selected' : ''}>Luzes - R$ 70,00</option>
              <option value="Platinado" ${ag.servico === 'Platinado' ? 'selected' : ''}>Platinado - R$ 120,00</option>
            </select>
          </div>

          <div class="input-group">
            <label>Valor (R$)</label>
            <input type="number" id="editValor" value="${ag.valor}" step="0.01" required>
          </div>

          <div class="input-group">
            <label>Status</label>
            <select id="editStatus" required>
              <option value="ativo" ${ag.status === 'ativo' ? 'selected' : ''}>Ativo</option>
              <option value="concluido" ${ag.status === 'concluido' ? 'selected' : ''}>Concluído</option>
              <option value="cancelado" ${ag.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
            </select>
          </div>

          <div class="input-group">
            <label>Observações</label>
            <textarea id="editObservacoes" rows="3">${ag.observacoes_cliente || ''}</textarea>
          </div>

          <div style="display: flex; gap: 12px; margin-top: 16px;">
            <button type="submit" class="btn btn-primary" style="flex: 1;">
              Salvar Alterações
            </button>
            <button type="button" class="btn btn-secondary" id="editCancelBtn">
              Cancelar
            </button>
          </div>
        </form>
      `,
      null
    )

    modal.render()

    // Handler do formulário
    document.getElementById('editForm').addEventListener('submit', async (e) => {
      e.preventDefault()

      const novosDados = {
        nome_cliente: document.getElementById('editNomeCliente').value,
        data: document.getElementById('editData').value,
        horario_inicio: document.getElementById('editHorarioInicio').value,
        horario_fim: document.getElementById('editHorarioFim').value,
        servico: document.getElementById('editServico').value,
        valor: parseFloat(document.getElementById('editValor').value),
        status: document.getElementById('editStatus').value,
        observacoes_cliente: document.getElementById('editObservacoes').value
      }

      // Verificar se mudou data ou horário
      const mudouHorario = 
        ag.data !== novosDados.data ||
        ag.horario_inicio !== novosDados.horario_inicio ||
        ag.horario_fim !== novosDados.horario_fim

      if (mudouHorario) {
        // VALIDAÇÃO: Serviços 60min só em horários exatos
        const [horaInicio, minInicio] = novosDados.horario_inicio.split(':').map(Number)
        const [horaFim, minFim] = novosDados.horario_fim.split(':').map(Number)
        const duracaoMinutos = (horaFim * 60 + minFim) - (horaInicio * 60 + minInicio)
        
        if (duracaoMinutos >= 60 && minInicio !== 0) {
          alert('⚠️ Serviços de 60 minutos ou mais só podem começar em horários exatos (09:00, 10:00, 11:00...)!\n\nHorário tentado: ' + novosDados.horario_inicio)
          return
        }

        // Verificar conflitos (excluindo o próprio agendamento)
        const { data: conflitos } = await agendamentoService.getByDate(novosDados.data)
        
        const temConflito = conflitos?.some(outro => {
          if (outro.id === ag.id) return false // Ignora ele mesmo
          if (outro.status === 'cancelado') return false

          return (
            (outro.horario_inicio <= novosDados.horario_inicio && outro.horario_fim > novosDados.horario_inicio) ||
            (outro.horario_inicio < novosDados.horario_fim && outro.horario_fim >= novosDados.horario_fim) ||
            (outro.horario_inicio >= novosDados.horario_inicio && outro.horario_fim <= novosDados.horario_fim)
          )
        })

        if (temConflito) {
          alert('⚠️ Já existe um agendamento neste horário!')
          return
        }

        // TODO: Verificar bloqueios quando implementado
        // const { bloqueado } = await bloqueioService.isHorarioBloqueado(...)
      }

      // Atualizar
      const { error } = await agendamentoService.update(ag.id, novosDados)

      if (error) {
        alert('❌ Erro ao atualizar agendamento: ' + error.message)
        return
      }

      alert('✅ Agendamento atualizado com sucesso!')
      modal.close()
      this.render()
    })

    // Botão cancelar
    document.getElementById('editCancelBtn').addEventListener('click', () => {
      modal.close()
    })

    // Auto-calcular valor ao mudar serviço
    document.getElementById('editServico').addEventListener('change', (e) => {
      const precos = {
        'Cabelo': 35,
        'Barba': 30,
        'Cabelo + Barba': 60,
        'Luzes': 70,
        'Platinado': 120
      }
      const servico = e.target.value
      if (precos[servico]) {
        document.getElementById('editValor').value = precos[servico]
      }
    })
  }

  getMonthName(month) {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    return months[month]
  }
}
