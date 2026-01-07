import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import type { User as PrismaUser, Role } from '@prisma/client'

// Validar NEXTAUTH_SECRET
if (!process.env.NEXTAUTH_SECRET) {
  console.error('⚠️ NEXTAUTH_SECRET não está definido! Isso causará erros de autenticação.')
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, // Necessário para funcionar com proxy reverso/cPanel
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        console.log('=== AUTHORIZE CHAMADO ===')
        console.log('Credentials recebidas:', credentials?.email ? 'email presente' : 'sem email')

        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('FALHA: Credenciais vazias')
            return null
          }

          console.log('Buscando usuário:', credentials.email)
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          })

          console.log('Usuário encontrado:', !!user)

          if (!user) {
            console.log('FALHA: Usuário não encontrado')
            return null
          }

          console.log('User active:', (user as any).active)

          // Verificar se o usuário está ativo
          if (!(user as any).active) {
            console.log('FALHA: Usuário não está ativo')
            return null
          }

          console.log('Comparando senha...')
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )
          console.log('Senha válida:', isPasswordValid)

          if (!isPasswordValid) {
            console.log('FALHA: Senha inválida')
            return null
          }

          console.log('SUCESSO! Retornando usuário')
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('ERRO no authorize:', error)
          return null
        }
      },
    }),

  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      try {
        if (user) {
          token.role = (user as PrismaUser).role
          token.id = user.id as string
          token.name = user.name as string
          token.email = user.email as string
        }

        // Atualizar token quando a sessão for atualizada
        if (trigger === 'update' && session) {
          token.name = session.name
          token.email = session.email
        }

        return token
      } catch (error) {
        console.error('Erro no callback jwt:', error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        if (session.user && token.id) {
          session.user.role = token.role as Role
          session.user.id = token.id as string
          session.user.name = token.name as string
          session.user.email = token.email as string
        }
        return session
      } catch (error) {
        console.error('Erro no callback session:', error)
        // Retornar sessão vazia em caso de erro
        return session
      }
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
})

