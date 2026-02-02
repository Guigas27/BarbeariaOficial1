import { authService } from './services/auth.js'
import { Header } from './components/Header.js'
import { LandingPage } from './pages/LandingPage.js'
import { LoginPage } from './pages/LoginPage.js'
import { CadastroPage } from './pages/CadastroPage.js'
import { AgendarPage } from './pages/AgendarPage.js'
import { MeusAgendamentosPage } from './pages/MeusAgendamentosPage.js'
import { AdminPage } from './pages/AdminPage.js'

class App {
  constructor() {
    this.user = null
    this.currentPage = null
    this.init()
  }

  async init() {
    // Verificar autenticação
    await this.checkAuth()

    // Setup de roteamento
    window.addEventListener('hashchange', () => this.handleRoute())
    
    // Listener para mudanças de autenticação
    authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        await this.checkAuth()
        this.handleRoute()
      } else if (event === 'SIGNED_OUT') {
        this.user = null
        window.location.hash = '#/login'
      }
    })

    // Rota inicial
    this.handleRoute()
  }

  async checkAuth() {
    try {
      const { data: user, error } = await authService.getCurrentUser()
      if (error) {
        console.error('Erro ao verificar autenticação:', error)
        this.user = null
        return
      }
      this.user = user
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      this.user = null
    }
  }

  async handleRoute() {
    const hash = window.location.hash || '#/'
    const app = document.getElementById('app')

    // Rotas públicas
    if (hash === '#/' || hash === '') {
      this.currentPage = new LandingPage(app)
      this.currentPage.render()
      return
    }

    if (hash === '#/login') {
      this.currentPage = new LoginPage(app)
      this.currentPage.render()
      return
    }

    if (hash.startsWith('#/cadastro')) {
      this.currentPage = new CadastroPage(app)
      this.currentPage.render()
      return
    }

    // Rotas protegidas
    if (!this.user) {
      window.location.hash = '#/login'
      return
    }

    // Renderizar header para rotas autenticadas
    app.innerHTML = ''
    const headerContainer = document.createElement('div')
    app.appendChild(headerContainer)
    const header = new Header(headerContainer, this.user)
    header.render()

    // Criar container para o conteúdo
    const contentContainer = document.createElement('div')
    app.appendChild(contentContainer)

    // Roteamento
    if (hash === '#/agendar') {
      this.currentPage = new AgendarPage(contentContainer, this.user)
      await this.currentPage.render()
    } 
    else if (hash.startsWith('#/meus-agendamentos')) {
      this.currentPage = new MeusAgendamentosPage(contentContainer, this.user)
      await this.currentPage.render()
    } 
    else if (hash === '#/admin') {
      if (this.user.role !== 'admin') {
        window.location.hash = '#/agendar'
        return
      }
      this.currentPage = new AdminPage(contentContainer, this.user)
      await this.currentPage.render()
    } 
    else {
      // Rota padrão para usuários autenticados
      if (this.user.role === 'admin') {
        window.location.hash = '#/admin'
      } else {
        window.location.hash = '#/agendar'
      }
    }

    // Atualizar link ativo no header
    if (header) {
      header.updateActiveLink()
    }
  }
}

// Inicializar app
document.addEventListener('DOMContentLoaded', () => {
  new App()
  
  // Registrar Service Worker para PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registrado:', registration.scope)
      })
      .catch(error => {
        console.log('❌ Erro ao registrar Service Worker:', error)
      })
  }
})
