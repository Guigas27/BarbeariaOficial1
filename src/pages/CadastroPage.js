import { authService } from '../services/auth.js'
import { validarEmail, validarSenha } from '../utils/helpers.js'

export class CadastroPage {
  constructor(container) {
    this.container = container
  }

  render() {
    this.container.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px;">
        <div style="width: 100%; max-width: 400px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div class="logo-icon" style="font-size: 64px; margin-bottom: 16px;">✂️</div>
            <h1 style="font-size: 32px; margin-bottom: 8px; color: var(--primary-gold);">Criar Conta</h1>
            <p style="color: var(--text-secondary);">Crie sua conta para agendar horários</p>
          </div>

          <div class="card" style="padding: 32px;">
            <form id="cadastroForm">
              <div class="input-group">
                <label>Nome Completo</label>
                <input 
                  type="text" 
                  id="nome" 
                  placeholder="Seu nome"
                  required
                  autocomplete="name"
                />
              </div>

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
                  placeholder="Mínimo 6 caracteres"
                  required
                  autocomplete="new-password"
                />
              </div>

              <div class="input-group">
                <label>Confirmar Senha</label>
                <input 
                  type="password" 
                  id="confirmarSenha" 
                  placeholder="Digite a senha novamente"
                  required
                  autocomplete="new-password"
                />
              </div>

              <div id="errorMessage" class="alert alert-error hidden" style="margin-bottom: 20px;"></div>
              <div id="successMessage" class="alert alert-success hidden" style="margin-bottom: 20px;"></div>

              <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: 16px;" id="submitBtn">
                Criar Conta
              </button>

              <div style="text-align: center;">
                <p style="color: var(--text-secondary); margin-bottom: 8px;">
                  Já tem conta? 
                  <a href="#/login" style="color: var(--primary-gold); text-decoration: none;">
                    Entre aqui
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
    const form = document.getElementById('cadastroForm')
    const errorMessage = document.getElementById('errorMessage')
    const successMessage = document.getElementById('successMessage')
    const submitBtn = document.getElementById('submitBtn')

    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      errorMessage.classList.add('hidden')
      successMessage.classList.add('hidden')

      const nome = document.getElementById('nome').value.trim()
      const email = document.getElementById('email').value.trim()
      const senha = document.getElementById('senha').value
      const confirmarSenha = document.getElementById('confirmarSenha').value

      // Validações
      if (nome.length < 3) {
        this.showError('Nome deve ter no mínimo 3 caracteres')
        return
      }

      if (!validarEmail(email)) {
        this.showError('Email inválido')
        return
      }

      if (!validarSenha(senha)) {
        this.showError('Senha deve ter no mínimo 6 caracteres')
        return
      }

      if (senha !== confirmarSenha) {
        this.showError('As senhas não coincidem')
        return
      }

      // Desabilitar botão
      submitBtn.disabled = true
      submitBtn.textContent = 'Criando conta...'

      // Fazer cadastro
      const { data, error } = await authService.signUp(email, senha, nome)

      if (error) {
        if (error.message.includes('already registered')) {
          this.showError('Este email já está cadastrado')
        } else {
          this.showError('Erro ao criar conta. Tente novamente.')
        }
        submitBtn.disabled = false
        submitBtn.textContent = 'Criar Conta'
        return
      }

      // Sucesso
      this.showSuccess('Conta criada com sucesso! Redirecionando...')
      
      setTimeout(() => {
        window.location.hash = '#/agendar'
      }, 2000)
    })
  }

  showError(message) {
    const errorMessage = document.getElementById('errorMessage')
    errorMessage.textContent = message
    errorMessage.classList.remove('hidden')
  }

  showSuccess(message) {
    const successMessage = document.getElementById('successMessage')
    successMessage.textContent = message
    successMessage.classList.remove('hidden')
  }
}
