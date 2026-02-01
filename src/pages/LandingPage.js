export class LandingPage {
  constructor(container) {
    this.container = container
  }

  render() {
    this.container.innerHTML = `
      <div style="min-height: 100vh; display: flex; flex-direction: column;">
        <header class="header">
          <div class="logo">
            <span class="logo-icon">✂️</span>
            <span>Barbearia Presença</span>
          </div>
          <div style="display: flex; gap: 12px;">
            <a href="#/login" class="btn btn-secondary">Entrar</a>
            <a href="#/cadastro" class="btn btn-primary">Cadastrar</a>
          </div>
        </header>

        <main style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 20px;">
          <div class="container" style="max-width: 800px; text-align: center;">
            <div style="margin-bottom: 48px;">
              <div class="logo-icon" style="font-size: 80px; margin-bottom: 24px;">✂️</div>
              <h1 style="font-size: 48px; margin-bottom: 16px; color: var(--primary-gold);">
                Barbearia Presença
              </h1>
              <p style="font-size: 20px; color: var(--text-secondary); margin-bottom: 32px;">
                Seu estilo, sua identidade
              </p>
              <p style="font-size: 18px; color: var(--text-secondary); margin-bottom: 48px;">
                Agende seu horário de forma rápida e prática. Sem filas, sem espera.<br>
                Experiência premium garantida.
              </p>
              <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
                <a href="#/cadastro" class="btn btn-primary" style="padding: 16px 32px; font-size: 18px;">
                  Começar Agora →
                </a>
                <a href="#/login" class="btn btn-secondary" style="padding: 16px 32px; font-size: 18px;">
                  Já tenho conta
                </a>
              </div>
            </div>

            <div class="grid grid-3" style="margin-top: 64px; text-align: center;">
              <div class="card">
                <div style="font-size: 48px; margin-bottom: 16px;">📅</div>
                <h3 style="margin-bottom: 12px; color: var(--primary-gold);">Agendamento Fácil</h3>
                <p style="color: var(--text-secondary);">
                  Escolha data, horário e serviço em poucos cliques. Simples e rápido.
                </p>
              </div>

              <div class="card">
                <div style="font-size: 48px; margin-bottom: 16px;">⏰</div>
                <h3 style="margin-bottom: 12px; color: var(--primary-gold);">Sem Espera</h3>
                <p style="color: var(--text-secondary);">
                  Horários em tempo real. Veja a disponibilidade e confirme na hora.
                </p>
              </div>

              <div class="card">
                <div style="font-size: 48px; margin-bottom: 16px;">⭐</div>
                <h3 style="margin-bottom: 12px; color: var(--primary-gold);">Qualidade Premium</h3>
                <p style="color: var(--text-secondary);">
                  Profissionais experientes e ambiente exclusivo para você.
                </p>
              </div>
            </div>

            <div class="card" style="margin-top: 48px; padding: 32px;">
              <h2 style="margin-bottom: 24px; color: var(--primary-gold);">Horário de Funcionamento</h2>
              <div style="text-align: left; max-width: 400px; margin: 0 auto;">
                <p style="margin-bottom: 12px; display: flex; justify-content: space-between;">
                  <span style="color: var(--text-secondary);">Segunda-feira:</span>
                  <span style="color: var(--text-primary);">15h às 19h</span>
                </p>
                <p style="margin-bottom: 12px; display: flex; justify-content: space-between;">
                  <span style="color: var(--text-secondary);">Terça a Sábado:</span>
                  <span style="color: var(--text-primary);">9h às 20h</span>
                </p>
                <p style="margin-bottom: 12px; display: flex; justify-content: space-between;">
                  <span style="color: var(--text-secondary);">Intervalo:</span>
                  <span style="color: var(--text-primary);">13h às 15h</span>
                </p>
                <p style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-secondary);">Domingo:</span>
                  <span style="color: var(--error);">Fechado</span>
                </p>
              </div>
            </div>
          </div>
        </main>

        <footer style="padding: 24px; text-align: center; border-top: 1px solid var(--border-color);">
          <div class="logo" style="justify-content: center; margin-bottom: 8px;">
            <span class="logo-icon">✂️</span>
            <span>BarberPro</span>
          </div>
          <p style="color: var(--text-muted); font-size: 14px;">
            Segunda a Sábado • 9h às 20h<br>
            Intervalo: 13h às 15h
          </p>
          <p style="color: var(--text-muted); font-size: 12px; margin-top: 16px;">
            © 2026 BarberPro. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    `
  }
}
