import { bloqueioService } from '../services/bloqueio.js'
import { formatarData, getNomeDiaSemana } from '../utils/helpers.js'
import { Modal } from '../components/Modal.js'

export class BloqueiosPage {
  constructor(container, user) {
    this.container = container
    this.user = user
    this.bloqueios = []
  }

  async render() {
    this.container.innerHTML = `
      <div class="main-content">
        <div class="container" style="padding-top: 40px; padding-bottom: 40px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; flex-wrap: wrap; gap: 16px;">
            <h1 style="font-size: clamp(24px, 5vw, 32px); margin: 0; color: var(--primary-gold);">Gerenciar Bloqueios</h1>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
              <button class="btn btn-primary" id="btnBloquearDia" style="white-space: nowrap;">
                🚫 Bloquear Dia Inteiro
              </button>
              <button class="btn btn-secondary" id="btnBloquearHorario" style="white-space: nowrap;">
                ⏰ Bloquear Horário
              </button>
            </div>
          </div>

          <div class="card">
            <h2 style="margin-bottom: 24px; font-size: 20px;">Bloqueios Ativos</h2>
            <div id="bloqueiosList"></div>
          </div>
        </div>
      </div>
    `

    await this.carregarBloqueios()
    this.setupEventListeners()
  }

  setupEventListeners() {
    document.getElementById('btnBloquearDia')?.addEventListener('click', () => {
      this.mostrarModalBloquearDia()
    })

    document.getElementById('btnBloquearHorario')?.addEventListener('click', () => {
      this.mostrarModalBloquearHorario()
    })
  }

  async carregarBloqueios() {
    const container = document.getElementById('bloqueiosList')
    
    const { data, error } = await bloqueioService.getAll()

    if (error) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-title">Erro ao carregar</div>
        </div>
      `
      return
    }

    this.bloqueios = data || []
    this.renderBloqueios(container)
  }

  renderBloqueios(container) {
    if (this.bloqueios.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📅</div>
          <div class="empty-state-title">Nenhum bloqueio ativo</div>
          <div class="empty-state-text">Crie bloqueios para impedir agendamentos</div>
        </div>
      `
      return
    }

    // Agrupar por data
    const porData = {}
    this.bloqueios.forEach(bloq => {
      if (!porData[bloq.data]) {
        porData[bloq.data] = []
      }
      porData[bloq.data].push(bloq)
    })

    const datas = Object.keys(porData).sort()

    container.innerHTML = datas.map(data => {
      const bloqueiosDoDia = porData[data]
      const diaSemana = getNomeDiaSemana(data)

      return `
        <div style="margin-bottom: 24px; border-left: 4px solid var(--error); padding-left: 16px;">
          <h3 style="font-size: 16px; color: var(--error); margin-bottom: 12px;">
            ${formatarData(data)} - ${diaSemana}
          </h3>
          <div style="display: grid; gap: 8px;">
            ${bloqueiosDoDia.map(bloq => this.renderBloqueioCard(bloq)).join('')}
          </div>
        </div>
      `
    }).join('')

    // Adicionar event listeners para botões remover
    container.querySelectorAll('[data-remover-bloqueio]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const bloqueioId = parseInt(btn.dataset.removerBloqueio)
        await this.removerBloqueio(bloqueioId)
      })
    })
  }

  renderBloqueioCard(bloq) {
    return `
      <div style="padding: 12px; background: var(--background-card); border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span>${bloq.tipo === 'dia_inteiro' ? '🚫' : '⏰'}</span>
            <span style="font-weight: 600; font-size: 14px;">
              ${bloq.tipo === 'dia_inteiro' ? 'Dia Inteiro' : `${bloq.horario_inicio} - ${bloq.horario_fim}`}
            </span>
          </div>
          ${bloq.motivo ? `
            <div style="font-size: 13px; color: var(--text-secondary); margin-left: 28px;">
              ${bloq.motivo}
            </div>
          ` : ''}
        </div>
        <button 
          class="btn btn-danger" 
          style="padding: 8px 16px; font-size: 13px;"
          data-remover-bloqueio="${bloq.id}"
        >
          Remover
        </button>
      </div>
    `
  }

  async removerBloqueio(bloqueioId) {
    if (!confirm('Tem certeza que deseja remover este bloqueio?')) {
      return
    }

    const { error } = await bloqueioService.remove(bloqueioId)

    if (error) {
      alert('❌ Erro ao remover bloqueio')
      return
    }

    alert('✅ Bloqueio removido!')
    this.render()
  }

  mostrarModalBloquearDia() {
    const hoje = new Date().toISOString().split('T')[0]
    
    const modal = new Modal(
      'Bloquear Dia Inteiro',
      `
        <form id="formBloquearDia" style="display: flex; flex-direction: column; gap: 16px;">
          <div class="input-group">
            <label>Data</label>
            <input type="date" id="dataDia" min="${hoje}" required>
          </div>

          <div class="input-group">
            <label>Motivo (opcional)</label>
            <input type="text" id="motivoDia" placeholder="Ex: Feriado, Folga">
          </div>

          <div style="display: flex; gap: 12px; margin-top: 16px;">
            <button type="button" class="btn btn-secondary" id="cancelarBtn">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" style="flex: 1;">
              🚫 Bloquear Dia
            </button>
          </div>
        </form>
      `,
      null
    )

    modal.render()

    document.getElementById('cancelarBtn').addEventListener('click', () => {
      modal.close()
    })

    document.getElementById('formBloquearDia').addEventListener('submit', async (e) => {
      e.preventDefault()
      
      const data = document.getElementById('dataDia').value
      const motivo = document.getElementById('motivoDia').value
      const submitBtn = e.target.querySelector('button[type="submit"]')
      
      submitBtn.disabled = true
      submitBtn.textContent = 'Bloqueando...'

      const { error } = await bloqueioService.bloquearDiaInteiro(data, motivo || null)

      if (error) {
        alert('❌ Erro ao bloquear dia')
        submitBtn.disabled = false
        submitBtn.textContent = '🚫 Bloquear Dia'
        return
      }

      alert('✅ Dia bloqueado com sucesso!')
      modal.close()
      this.render()
    })
  }

  mostrarModalBloquearHorario() {
    const hoje = new Date().toISOString().split('T')[0]
    
    const modal = new Modal(
      'Bloquear Horário',
      `
        <form id="formBloquearHorario" style="display: flex; flex-direction: column; gap: 16px;">
          <div class="input-group">
            <label>Data</label>
            <input type="date" id="dataHorario" min="${hoje}" required>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="input-group">
              <label>Início</label>
              <input type="time" id="horarioInicio" required>
            </div>

            <div class="input-group">
              <label>Fim</label>
              <input type="time" id="horarioFim" required>
            </div>
          </div>

          <div class="input-group">
            <label>Motivo (opcional)</label>
            <input type="text" id="motivoHorario" placeholder="Ex: Reunião, Compromisso">
          </div>

          <div style="display: flex; gap: 12px; margin-top: 16px;">
            <button type="button" class="btn btn-secondary" id="cancelarBtn">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" style="flex: 1;">
              ⏰ Bloquear Horário
            </button>
          </div>
        </form>
      `,
      null
    )

    modal.render()

    document.getElementById('cancelarBtn').addEventListener('click', () => {
      modal.close()
    })

    document.getElementById('formBloquearHorario').addEventListener('submit', async (e) => {
      e.preventDefault()
      
      const data = document.getElementById('dataHorario').value
      const horarioInicio = document.getElementById('horarioInicio').value
      const horarioFim = document.getElementById('horarioFim').value
      const motivo = document.getElementById('motivoHorario').value

      if (horarioInicio >= horarioFim) {
        alert('⚠️ Horário de início deve ser antes do fim')
        return
      }

      const submitBtn = e.target.querySelector('button[type="submit"]')
      submitBtn.disabled = true
      submitBtn.textContent = 'Bloqueando...'

      const { error } = await bloqueioService.bloquearHorario(
        data, 
        horarioInicio, 
        horarioFim, 
        motivo || null
      )

      if (error) {
        alert('❌ Erro ao bloquear horário')
        submitBtn.disabled = false
        submitBtn.textContent = '⏰ Bloquear Horário'
        return
      }

      alert('✅ Horário bloqueado com sucesso!')
      modal.close()
      this.render()
    })
  }
}
