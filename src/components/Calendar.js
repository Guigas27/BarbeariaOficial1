import { isBarberiaAberta, isDataPassado, formatarDataCurta } from '../utils/helpers.js'

export class Calendar {
  constructor(container, onDateSelect, checkAvailability = null) {
    this.container = container
    this.onDateSelect = onDateSelect
    this.checkAvailability = checkAvailability
    this.currentDate = new Date()
    this.selectedDate = null
  }

  render() {
    const year = this.currentDate.getFullYear()
    const month = this.currentDate.getMonth()

    this.container.innerHTML = `
      <div class="calendar">
        <div class="calendar-header">
          <button class="btn btn-secondary" id="prevMonth">◀</button>
          <h3>${this.getMonthName(month)} ${year}</h3>
          <button class="btn btn-secondary" id="nextMonth">▶</button>
        </div>
        <div class="calendar-grid">
          ${this.renderWeekDays()}
          ${this.renderDays(year, month)}
        </div>
      </div>
    `

    this.attachEvents()
  }

  renderWeekDays() {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    return days.map(day => `
      <div class="calendar-day" style="font-weight: bold; cursor: default; border: none;">
        ${day}
      </div>
    `).join('')
  }

  renderDays(year, month) {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let html = ''

    // Dias vazios antes do primeiro dia do mês
    for (let i = 0; i < firstDay; i++) {
      html += '<div class="calendar-day disabled"></div>'
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      
      let classes = ['calendar-day']
      let disabled = false

      // Verificar se é hoje
      if (date.toDateString() === today.toDateString()) {
        classes.push('today')
      }

      // Verificar se está selecionado
      if (this.selectedDate === dateStr) {
        classes.push('selected')
      }

      // Verificar se é passado ou se a barbearia está fechada
      if (isDataPassado(dateStr) || !isBarberiaAberta(dateStr)) {
        classes.push('disabled')
        disabled = true
      }
      
      // Verificar se o dia tem horários disponíveis (se a função foi fornecida)
      if (!disabled && this.checkAvailability) {
        const hasAvailability = this.checkAvailability(dateStr)
        if (!hasAvailability) {
          classes.push('disabled')
          disabled = true
        }
      }

      html += `
        <div class="${classes.join(' ')}" data-date="${dateStr}" ${disabled ? '' : 'style="cursor: pointer;"'}>
          ${day}
        </div>
      `
    }

    return html
  }

  attachEvents() {
    const prevBtn = document.getElementById('prevMonth')
    const nextBtn = document.getElementById('nextMonth')
    const days = this.container.querySelectorAll('.calendar-day[data-date]')

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1)
        this.render()
      })
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1)
        this.render()
      })
    }

    days.forEach(day => {
      if (!day.classList.contains('disabled')) {
        day.addEventListener('click', () => {
          const date = day.getAttribute('data-date')
          this.selectedDate = date
          this.render()
          if (this.onDateSelect) {
            this.onDateSelect(date)
          }
        })
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

  getSelectedDate() {
    return this.selectedDate
  }

  setDate(date) {
    this.selectedDate = date
    const [year, month] = date.split('-')
    this.currentDate = new Date(year, month - 1, 1)
    this.render()
  }
}
