import { Calendar } from '../components/Calendar.js'
import { agendamentoService } from '../services/agendamento.js'
import { SERVICOS, gerarHorariosDisponiveis, formatarData, formatarValor } from '../utils/helpers.js'

export class AgendarPage {
  constructor(container, user) {
    this.container = container
    this.user = user
    this.currentStep = 1
    this.agendamento = {
      servico: null,
      data: null,
      horario: null,
      observacoes: ''
    }
    this.horariosOcupados = []
  }

  async render() {
    this.container.innerHTML = `
      <div class="main-content">
        <div class="container" style="max-width: 900px; padding-top: clamp(20px, 5vw, 40px); padding-bottom: clamp(20px, 5vw, 40px);">
          <h1 style="font-size: clamp(24px, 6vw, 32px); margin-bottom: 32px; text-align: center; color: var(--primary-gold);">
            Novo Agendamento
          </h1>

          <div class="steps">
            <div class="step ${this.currentStep >= 1 ? 'active' : ''} ${this.currentStep > 1 ? 'completed' : ''}">
              <div class="step-circle">1</div>
              <div class="step-label">Serviço</div>
            </div>
            <div class="step ${this.currentStep >= 2 ? 'active' : ''} ${this.currentStep > 2 ? 'completed' : ''}">
              <div class="step-circle">2</div>
              <div class="step-label">Data</div>
            </div>
            <div class="step ${this.currentStep >= 3 ? 'active' : ''} ${this.currentStep > 3 ? 'completed' : ''}">
              <div class="step-circle">3</div>
              <div class="step-label">Horário</div>
            </div>
            <div class="step ${this.currentStep >= 4 ? 'active' : ''}">
              <div class="step-circle">4</div>
              <div class="step-label">Confirmar</div>
            </div>
          </div>

          <div id="stepContent"></div>
        </div>
      </div>
    `

    this.renderStep()
  }

  renderStep() {
    const stepContent = document.getElementById('stepContent')
    
    switch(this.currentStep) {
      case 1:
        this.renderStepServico(stepContent)
        break
      case 2:
        this.renderStepData(stepContent)
        break
      case 3:
        this.renderStepHorario(stepContent)
        break
      case 4:
        this.renderStepConfirmar(stepContent)
        break
    }
  }

  renderStepServico(container) {
    container.innerHTML = `
      <div>
        <h2 style="margin-bottom: 24px; text-align: center;">Escolha o Serviço</h2>
        <div class="grid grid-2" id="servicosGrid"></div>
      </div>
    `

    const grid = document.getElementById('servicosGrid')
    
    SERVICOS.forEach(servico => {
      const card = document.createElement('div')
      card.className = 'service-card'
      if (this.agendamento.servico?.nome === servico.nome) {
        card.classList.add('selected')
      }
      
      card.innerHTML = `
        <div class="service-name">${servico.nome}</div>
        <div class="service-duration">⏱️ ${servico.duracao} minutos</div>
        <div class="service-price">${formatarValor(servico.valor)}</div>
      `
      
      card.addEventListener('click', () => {
        this.agendamento.servico = servico
        this.currentStep = 2
        this.renderStep()
      })
      
      grid.appendChild(card)
    })
  }

  renderStepData(container) {
    container.innerHTML = `
      <div>
        <h2 style="margin-bottom: 24px; text-align: center;">Escolha a Data</h2>
        <div style="max-width: 600px; margin: 0 auto;">
          <div id="calendar"></div>
          <div style="margin-top: 24px; display: flex; gap: 12px; justify-content: center;">
            <button class="btn btn-secondary" id="voltarBtn">← Voltar</button>
          </div>
        </div>
      </div>
    `

    const calendarContainer = document.getElementById('calendar')
    const calendar = new Calendar(calendarContainer, async (date) => {
      this.agendamento.data = date
      
      // Carregar horários ocupados
      await this.carregarHorariosOcupados(date)
      
      this.currentStep = 3
      this.renderStep()
    })
    
    if (this.agendamento.data) {
      calendar.setDate(this.agendamento.data)
    } else {
      calendar.render()
    }

    document.getElementById('voltarBtn').addEventListener('click', () => {
      this.currentStep = 1
      this.renderStep()
    })
  }

  async carregarHorariosOcupados(data) {
    const { data: agendamentos } = await agendamentoService.getByDate(data)
    this.horariosOcupados = agendamentos || []
  }

  renderStepHorario(container) {
    const horariosDisponiveis = gerarHorariosDisponiveis(
      this.agendamento.data, 
      this.agendamento.servico.duracao
    )

    container.innerHTML = `
      <div>
        <h2 style="margin-bottom: 8px; text-align: center;">Escolha o Horário</h2>
        <p style="text-align: center; color: var(--text-secondary); margin-bottom: 24px;">
          ${formatarData(this.agendamento.data)}
        </p>
        <div style="max-width: 700px; margin: 0 auto;">
          <div class="time-slots" id="timeSlots"></div>
          <div style="margin-top: 24px; display: flex; gap: 12px; justify-content: center;">
            <button class="btn btn-secondary" id="voltarBtn">← Voltar</button>
          </div>
        </div>
      </div>
    `

    const slotsContainer = document.getElementById('timeSlots')

    if (horariosDisponiveis.length === 0) {
      slotsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📅</div>
          <div class="empty-state-title">Sem horários disponíveis</div>
          <div class="empty-state-text">Escolha outra data</div>
        </div>
      `
    } else {
      horariosDisponiveis.forEach(slot => {
        const isOcupado = this.horariosOcupados.some(ag => {
          return ag.horario_inicio === slot.inicio
        })

        const slotElement = document.createElement('div')
        slotElement.className = 'time-slot'
        
        if (isOcupado) {
          slotElement.classList.add('occupied')
        } else if (this.agendamento.horario?.inicio === slot.inicio) {
          slotElement.classList.add('selected')
        }

        slotElement.textContent = slot.inicio
        
        if (!isOcupado) {
          slotElement.addEventListener('click', () => {
            this.agendamento.horario = slot
            this.currentStep = 4
            this.renderStep()
          })
        }

        slotsContainer.appendChild(slotElement)
      })
    }

    document.getElementById('voltarBtn').addEventListener('click', () => {
      this.currentStep = 2
      this.renderStep()
    })
  }

  renderStepConfirmar(container) {
    container.innerHTML = `
      <div>
        <h2 style="margin-bottom: 24px; text-align: center;">Confirmar Agendamento</h2>
        <div style="max-width: 500px; margin: 0 auto;">
          <div class="card" style="margin-bottom: 24px;">
            <h3 style="color: var(--primary-gold); margin-bottom: 16px;">Resumo</h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Serviço:</span>
                <span style="font-weight: 600;">${this.agendamento.servico.nome}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Data:</span>
                <span style="font-weight: 600;">${formatarData(this.agendamento.data)}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Horário:</span>
                <span style="font-weight: 600;">${this.agendamento.horario.inicio} - ${this.agendamento.horario.fim}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Duração:</span>
                <span style="font-weight: 600;">${this.agendamento.servico.duracao} minutos</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding-top: 12px; border-top: 1px solid var(--border-color);">
                <span style="color: var(--text-secondary);">Valor:</span>
                <span style="font-weight: 700; font-size: 20px; color: var(--primary-gold);">
                  ${formatarValor(this.agendamento.servico.valor)}
                </span>
              </div>
            </div>
          </div>

          <div class="input-group">
            <label>Observações (opcional)</label>
            <textarea 
              id="observacoes" 
              placeholder="Alguma observação para o barbeiro?"
              style="min-height: 80px;"
            >${this.agendamento.observacoes}</textarea>
          </div>

          <div id="errorMessage" class="alert alert-error hidden"></div>

          <div style="display: flex; gap: 12px;">
            <button class="btn btn-secondary" id="voltarBtn" style="flex: 1;">
              ← Voltar
            </button>
            <button class="btn btn-primary" id="confirmarBtn" style="flex: 2;">
              Confirmar Agendamento
            </button>
          </div>
        </div>
      </div>
    `

    const observacoesInput = document.getElementById('observacoes')
    observacoesInput.addEventListener('input', (e) => {
      this.agendamento.observacoes = e.target.value
    })

    document.getElementById('voltarBtn').addEventListener('click', () => {
      this.currentStep = 3
      this.renderStep()
    })

    document.getElementById('confirmarBtn').addEventListener('click', () => {
      this.confirmarAgendamento()
    })
  }

  async confirmarAgendamento() {
    const confirmarBtn = document.getElementById('confirmarBtn')
    const errorMessage = document.getElementById('errorMessage')
    
    errorMessage.classList.add('hidden')
    confirmarBtn.disabled = true
    confirmarBtn.textContent = 'Confirmando...'

    // Verificar disponibilidade novamente
    const { available } = await agendamentoService.isTimeSlotAvailable(
      this.agendamento.data,
      this.agendamento.horario.inicio,
      this.agendamento.horario.fim
    )

    if (!available) {
      errorMessage.textContent = 'Este horário acabou de ser ocupado. Por favor, escolha outro.'
      errorMessage.classList.remove('hidden')
      confirmarBtn.disabled = false
      confirmarBtn.textContent = 'Confirmar Agendamento'
      return
    }

    // Criar agendamento
    const { data, error } = await agendamentoService.create({
      user_id: this.user.id,
      nome_cliente: this.user.nome,
      data: this.agendamento.data,
      horario_inicio: this.agendamento.horario.inicio,
      horario_fim: this.agendamento.horario.fim,
      servico: this.agendamento.servico.nome,
      valor: this.agendamento.servico.valor,
      observacoes_cliente: this.agendamento.observacoes || null
    })

    if (error) {
      errorMessage.textContent = 'Erro ao criar agendamento. Tente novamente.'
      errorMessage.classList.remove('hidden')
      confirmarBtn.disabled = false
      confirmarBtn.textContent = 'Confirmar Agendamento'
      return
    }

    // Sucesso - redirecionar
    window.location.hash = '#/meus-agendamentos?success=true'
  }
}
