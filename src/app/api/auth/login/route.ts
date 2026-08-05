import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { comparePassword, generateToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ message: 'Email dan password wajib diisi' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ message: 'Email tidak ditemukan' }, { status: 404 })
    }

    const isValid = await comparePassword(password, user.password)
    if (!isValid) {
      return NextResponse.json({ message: 'Password yang Anda masukkan salah' }, { status: 401 })
    }

    const token = generateToken(user.id)

    const response = NextResponse.json({
      message: 'Login berhasil',
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      token,
    })

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: `Terjadi kesalahan server: ${error.message || String(error)}` },
      { status: 500 }
    )
  }
}
