import { authService } from '../services/auth.js'
import { validarEmail } from '../utils/helpers.js'

export class LoginPage {
  constructor(container) {
    this.container = container
  }

  render() {
    this.container.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px;">
        <div style="width: 100%; max-width: 400px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div class="logo-icon" style="font-size: 64px; margin-bottom: 16px;">✂️</div>
            <h1 style="font-size: 32px; margin-bottom: 8px; color: var(--primary-gold);">Entrar</h1>
            <p style="color: var(--text-secondary);">Entre para acessar seus agendamentos</p>
          </div>

          <div class="card" style="padding: 32px;">
            <form id="loginForm">
              <div class="input-group">
                <label>E-mail</label>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="seu@email.com"
                  required
                  autocomplete="email"
                />
              </div>

              <div class="input-group">
                <label>Senha</label>
                <input 
                  type="password" 
                  id="senha" 
                  placeholder="••••••"
                  required
                  autocomplete="current-password"
                />
              </div>

              <div id="errorMessage" class="alert alert-error hidden" style="margin-bottom: 20px;"></div>

              <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: 16px;" id="submitBtn">
                Entrar
              </button>

              <div style="text-align: center;">
                <p style="color: var(--text-secondary); margin-bottom: 8px;">
                  Não tem conta? 
                  <a href="#/cadastro" style="color: var(--primary-gold); text-decoration: none;">
                    Cadastre-se
                  </a>
                </p>
                <a href="#/" style="color: var(--text-secondary); text-decoration: none; font-size: 14px;">
                  ← Voltar
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    `

    this.attachEvents()
  }

  attachEvents() {
    const form = document.getElementById('loginForm')
    const errorMessage = document.getElementById('errorMessage')
    const submitBtn = document.getElementById('submitBtn')

    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      errorMessage.classList.add('hidden')

      const email = document.getElementById('email').value.trim()
      const senha = document.getElementById('senha').value

      // Validações
      if (!validarEmail(email)) {
        this.showError('Email inválido')
        return
      }

      if (senha.length < 6) {
        this.showError('Senha deve ter no mínimo 6 caracteres')
        return
      }

      // Desabilitar botão
      submitBtn.disabled = true
      submitBtn.textContent = 'Entrando...'

      // Fazer login
      const { data, error } = await authService.signIn(email, senha)

      if (error) {
        this.showError('Email ou senha incorretos')
        submitBtn.disabled = false
        submitBtn.textContent = 'Entrar'
        return
      }

      // Redirecionar baseado no role
      if (data.userData.role === 'admin') {
        window.location.hash = '#/admin'
      } else {
        window.location.hash = '#/agendar'
      }
    })
  }

  showError(message) {
    const errorMessage = document.getElementById('errorMessage')
    errorMessage.textContent = message
    errorMessage.classList.remove('hidden')
  }
}
