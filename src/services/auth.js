import { supabase } from './supabase.js'

export const authService = {
  // Registrar novo usuário
  async signUp(email, password, nome) {
    try {
      // Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      // Criar registro na tabela users
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          nome,
          email,
          role: 'cliente'
        })

      if (userError) throw userError

      return { data: authData, error: null }
    } catch (error) {
      console.error('Erro no cadastro:', error)
      return { data: null, error }
    }
  },

  // Login
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Buscar dados completos do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (userError) throw userError

      return { data: { ...data, userData }, error: null }
    } catch (error) {
      console.error('Erro no login:', error)
      return { data: null, error }
    }
  },

  // Logout
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Erro no logout:', error)
      return { error }
    }
  },

  // Obter usuário atual
  async getCurrentUser() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) throw authError
      if (!user) return { data: null, error: null }

      // Buscar dados completos do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userError) throw userError

      return { data: userData, error: null }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error)
      return { data: null, error }
    }
  },

  // Verificar se é admin
  async isAdmin() {
    const { data: user } = await this.getCurrentUser()
    return user?.role === 'admin'
  },

  // Listener para mudanças de autenticação
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}
