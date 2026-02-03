import { authService } from '../services/auth.js'

export class Header {
  constructor(container, user) {
    this.container = container
    this.user = user
    this.menuOpen = false
  }

  render() {
    this.container.innerHTML = `
      <header class="header">
        <div class="logo">
          <span class="logo-icon">✂️</span>
          <span>Barbearia Presença</span>
        </div>
        <button class="btn-menu" id="menuToggle">
          <span>☰</span>
        </button>
      </header>

      <nav class="sidebar ${this.menuOpen ? 'open' : ''}" id="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <span class="logo-icon">✂️</span>
            <span>Barbearia Presença</span>
          </div>
        </div>
        <div class="nav-menu">
          ${this.user.role === 'admin' ? `
            <a href="#/admin" class="nav-item" data-page="admin">
              <span>📊</span>
              <span>Área do Barbeiro</span>
            </a>
            <a href="#/agendar-admin" class="nav-item" data-page="agendar-admin">
              <span>➕</span>
              <span>Agendar (Admin)</span>
            </a>
            <a href="#/bloqueios" class="nav-item" data-page="bloqueios">
              <span>🚫</span>
              <span>Bloqueios</span>
            </a>
          ` : ''}
          <a href="#/agendar" class="nav-item" data-page="agendar">
            <span>📅</span>
            <span>Agendar</span>
          </a>
          <a href="#/meus-agendamentos" class="nav-item" data-page="meus-agendamentos">
            <span>📋</span>
            <span>Meus Agendamentos</span>
          </a>
          <button class="nav-item" id="logoutBtn" style="background: none; border: none; width: 100%; text-align: left;">
            <span>🚪</span>
            <span>Sair</span>
          </button>
        </div>
      </nav>
    `

    this.attachEvents()
    this.updateActiveLink()
  }

  attachEvents() {
    const menuToggle = document.getElementById('menuToggle')
    const sidebar = document.getElementById('sidebar')
    const logoutBtn = document.getElementById('logoutBtn')
    const navItems = document.querySelectorAll('.nav-item[data-page]')

    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        this.menuOpen = !this.menuOpen
        sidebar.classList.toggle('open')
      })
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await authService.signOut()
        window.location.hash = '#/login'
      })
    }

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          this.menuOpen = false
          sidebar.classList.remove('open')
        }
      })
    })

    // Fechar menu ao clicar fora (mobile)
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && 
          this.menuOpen && 
          !sidebar.contains(e.target) && 
          !menuToggle.contains(e.target)) {
        this.menuOpen = false
        sidebar.classList.remove('open')
      }
    })
  }

  updateActiveLink() {
    const hash = window.location.hash
    const navItems = document.querySelectorAll('.nav-item[data-page]')
    
    navItems.forEach(item => {
      item.classList.remove('active')
      const page = item.getAttribute('data-page')
      if (hash.includes(page)) {
        item.classList.add('active')
      }
    })
  }
}
