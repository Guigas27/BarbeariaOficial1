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
      <div style="padding: 40px 20px; width: 100%; overflow: visible;">
        <div style="max-width: 1200px; margin: 0 auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; flex-wrap: wrap; gap: 16px;">
            <h1 style="font-size: 28px; margin: 0; color: var(--text-primary); min-width: 250px;">Gerenciar Bloqueios</h1>
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

  async carregarBloqueios() {
    const { data, error } = await bloqueioService.getAll()

    if (error) {
      console.error('Erro ao carregar bloqueios:', error)
      document.getElementById('bloqueiosList').innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">❌</div>
          <div class="empty-state-title">Erro ao carregar bloqueios</div>
        </div>
      `
      return
    }

    this.bloqueios = data || []
    this.renderBloqueios()
  }

  renderBloqueios() {
    const container = document.getElementById('bloqueiosList')

    if (this.bloqueios.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📅</div>
          <div class="empty-state-title">Nenhum bloqueio ativo</div>
          <div class="empty-state-text">Crie bloqueios para impedir agendamentos em dias ou horários específicos</div>
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
        <div style="margin-bottom: 24px; border-left: 4px solid var(--error); padding-left: 20px;">
          <h3 style="font-size: 16px; color: var(--error); margin-bottom: 12px;">
            ${formatarData(data)} - ${diaSemana}
          </h3>
          <div style="display: grid; gap: 12px;">
            ${bloqueiosDoDia.map(bloq => this.renderBloqueioCard(bloq)).join('')}
          </div>
        </div>
      `
    }).join('')

    // Event listeners para botões de remover
    document.querySelectorAll('[data-remove-bloqueio]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.getAttribute('data-remove-bloqueio'))
        await this.removerBloqueio(id)
      })
    })
  }

  renderBloqueioCard(bloq) {
    const isDiaInteiro = bloq.tipo === 'dia_inteiro'

    return `
      <div class="card" style="padding: 16px; background: var(--background-card-hover);">
        <div style="display: flex; justify-content: space-between; align-items: start; gap: 16px;">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 20px;">${isDiaInteiro ? '🚫' : '⏰'}</span>
              <strong style="color: var(--error);">
                ${isDiaInteiro ? 'Dia Inteiro Bloqueado' : `${bloq.horario_inicio} - ${bloq.horario_fim}`}
              </strong>
            </div>
            ${bloq.motivo ? `
              <div style="color: var(--text-secondary); font-size: 14px; margin-top: 4px;">
                💬 ${bloq.motivo}
              </div>
            ` : ''}
            <div style="color: var(--text-secondary); font-size: 12px; margin-top: 8px;">
              Criado em ${new Date(bloq.created_at).toLocaleString('pt-BR')}
            </div>
          </div>
          <button 
            class="btn btn-danger" 
            data-remove-bloqueio="${bloq.id}"
            style="padding: 8px 16px; font-size: 13px;">
            🗑️ Remover
          </button>
        </div>
      </div>
    `
  }

  setupEventListeners() {
    // Botão bloquear dia inteiro
    document.getElementById('btnBloquearDia')?.addEventListener('click', () => {
      this.mostrarModalBloquearDia()
    })

    // Botão bloquear horário
    document.getElementById('btnBloquearHorario')?.addEventListener('click', () => {
      this.mostrarModalBloquearHorario()
    })
  }

  mostrarModalBloquearDia() {
    const modal = new Modal(
      'Bloquear Dia Inteiro',
      `
        <form id="formBloquearDia" style="display: flex; flex-direction: column; gap: 16px;">
          <div class="input-group">
            <label>Data</label>
            <input type="date" id="bloqDiaData" required min="${new Date().toISOString().split('T')[0]}">
          </div>

          <div class="input-group">
            <label>Motivo (opcional)</label>
            <input type="text" id="bloqDiaMotivo" placeholder="Ex: Feriado, Folga, Evento...">
          </div>

          <div style="display: flex; gap: 12px; margin-top: 16px;">
            <button type="submit" class="btn btn-primary" style="flex: 1;">
              🚫 Bloquear Dia
            </button>
            <button type="button" class="btn btn-secondary" id="bloqDiaCancelar">
              Cancelar
            </button>
          </div>
        </form>
      `,
      null
    )

    modal.render()

    document.getElementById('formBloquearDia').addEventListener('submit', async (e) => {
      e.preventDefault()
      
      const data = document.getElementById('bloqDiaData').value
      const motivo = document.getElementById('bloqDiaMotivo').value

      const { error } = await bloqueioService.bloquearDiaInteiro(data, motivo, this.user.id)

      if (error) {
        alert('❌ Erro ao bloquear dia: ' + error.message)
        return
      }

      alert('✅ Dia bloqueado com sucesso!')
      modal.close()
      await this.carregarBloqueios()
    })

    document.getElementById('bloqDiaCancelar').addEventListener('click', () => {
      modal.close()
    })
  }

  mostrarModalBloquearHorario() {
    const modal = new Modal(
      'Bloquear Horário Específico',
      `
        <form id="formBloquearHorario" style="display: flex; flex-direction: column; gap: 16px;">
          <div class="input-group">
            <label>Data</label>
            <input type="date" id="bloqHorData" required min="${new Date().toISOString().split('T')[0]}">
          </div>

          <div class="grid grid-2" style="gap: 16px;">
            <div class="input-group">
              <label>Horário Início</label>
              <input type="time" id="bloqHorInicio" required>
            </div>

            <div class="input-group">
              <label>Horário Fim</label>
              <input type="time" id="bloqHorFim" required>
            </div>
          </div>

          <div class="input-group">
            <label>Motivo (opcional)</label>
            <input type="text" id="bloqHorMotivo" placeholder="Ex: Reunião, Almoço estendido...">
          </div>

          <div style="display: flex; gap: 12px; margin-top: 16px;">
            <button type="submit" class="btn btn-primary" style="flex: 1;">
              ⏰ Bloquear Horário
            </button>
            <button type="button" class="btn btn-secondary" id="bloqHorCancelar">
              Cancelar
            </button>
          </div>
        </form>
      `,
      null
    )

    modal.render()

    document.getElementById('formBloquearHorario').addEventListener('submit', async (e) => {
      e.preventDefault()
      
      const data = document.getElementById('bloqHorData').value
      const inicio = document.getElementById('bloqHorInicio').value
      const fim = document.getElementById('bloqHorFim').value
      const motivo = document.getElementById('bloqHorMotivo').value

      // Validar horários
      if (inicio >= fim) {
        alert('⚠️ Horário de início deve ser antes do horário de fim!')
        return
      }

      const { error } = await bloqueioService.bloquearHorario(
        data, inicio, fim, motivo, this.user.id
      )

      if (error) {
        alert('❌ Erro ao bloquear horário: ' + error.message)
        return
      }

      alert('✅ Horário bloqueado com sucesso!')
      modal.close()
      await this.carregarBloqueios()
    })

    document.getElementById('bloqHorCancelar').addEventListener('click', () => {
      modal.close()
    })
  }

  async removerBloqueio(id) {
    if (!confirm('Tem certeza que deseja remover este bloqueio?')) return

    const { error } = await bloqueioService.remove(id)

    if (error) {
      alert('❌ Erro ao remover bloqueio: ' + error.message)
      return
    }

    alert('✅ Bloqueio removido com sucesso!')
    await this.carregarBloqueios()
  }
}
