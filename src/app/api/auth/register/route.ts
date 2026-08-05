import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, validateEmail, validatePassword } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, username, email, password, confirmPassword } = body

    if (!name || !username || !email || !password || !confirmPassword) {
      return NextResponse.json({ message: 'Semua field wajib diisi' }, { status: 400 })
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ message: 'Format email tidak valid' }, { status: 400 })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json({ message: passwordValidation.error }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ message: 'Password dan konfirmasi password tidak cocok' }, { status: 400 })
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({ message: 'Email sudah terdaftar' }, { status: 409 })
    }

    const existingUsername = await prisma.user.findUnique({ where: { username } })
    if (existingUsername) {
      return NextResponse.json({ message: 'Username sudah digunakan' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      message: 'Registrasi berhasil',
      user,
    }, { status: 201 })
  } catch (error: any) {
    console.error('Register error:', error)
    return NextResponse.json(
      { message: `Terjadi kesalahan saat mendaftar: ${error.message || String(error)}` },
      { status: 500 }
    )
  }
}
