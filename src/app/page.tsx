import { redirect } from 'next/navigation'
import { auth } from '@/auth'

const BUILD_MARKER = 'BUILD_2026_01_07_15_00'; // Change this after each deploy to track if production updates

export default async function Home() {
  const session = await auth()

  console.log(`[BUILD CHECK] Current build: ${BUILD_MARKER}`);

  if (session?.user) {
    // Redirecionar para dashboard apropriado baseado no role
    if (session.user.role === 'ADMIN') {
      redirect('/admin/dashboard')
    } else {
      redirect('/dashboard')
    }
  }

  // Se não está autenticado, redirecionar para login
  redirect('/login')
}
