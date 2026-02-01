export class Modal {
  constructor(title, content, onClose) {
    this.title = title
    this.content = content
    this.onClose = onClose
    this.modalElement = null
  }

  render() {
    // Remover modal existente se houver
    const existingModal = document.querySelector('.modal-overlay')
    if (existingModal) {
      existingModal.remove()
    }

    const overlay = document.createElement('div')
    overlay.className = 'modal-overlay'
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">${this.title}</h2>
          <button class="modal-close" id="modalClose">×</button>
        </div>
        <div class="modal-content">
          ${this.content}
        </div>
      </div>
    `

    document.body.appendChild(overlay)
    this.modalElement = overlay

    this.attachEvents()

    // Focar no primeiro input se houver
    setTimeout(() => {
      const firstInput = overlay.querySelector('input, textarea, select')
      if (firstInput) {
        firstInput.focus()
      }
    }, 100)
  }

  attachEvents() {
    const closeBtn = document.getElementById('modalClose')
    const overlay = this.modalElement

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close())
    }

    // Fechar ao clicar fora do modal
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.close()
      }
    })

    // Fechar com ESC
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        this.close()
        document.removeEventListener('keydown', handleEsc)
      }
    }
    document.addEventListener('keydown', handleEsc)
  }

  close() {
    if (this.modalElement) {
      this.modalElement.remove()
      this.modalElement = null
    }
    if (this.onClose) {
      this.onClose()
    }
  }

  updateContent(content) {
    if (this.modalElement) {
      const contentElement = this.modalElement.querySelector('.modal-content')
      if (contentElement) {
        contentElement.innerHTML = content
      }
    }
  }
}
