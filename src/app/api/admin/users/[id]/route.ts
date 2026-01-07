import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/admin/users/[id] - Atualiza usuário (ativar/desativar)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem gerenciar usuários.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { active, role, name } = body;

    // Validar que o usuário não está tentando desativar a si mesmo
    if (session.user.id === id && active === false) {
      return NextResponse.json(
        { error: 'Você não pode desativar sua própria conta.' },
        { status: 400 }
      );
    }

    // Validar que o usuário existe
    const userExists = await prisma.user.findUnique({
      where: { id },
    });

    if (!userExists) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(active !== undefined && { active }),
        ...(role && { role }),
        ...(name && { name }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Remove usuário (soft delete via active=false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem gerenciar usuários.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Validar que o usuário não está tentando deletar a si mesmo
    if (session.user.id === id) {
      return NextResponse.json(
        { error: 'Você não pode deletar sua própria conta.' },
        { status: 400 }
      );
    }

    // Validar que o usuário existe
    const userExists = await prisma.user.findUnique({
      where: { id },
    });

    if (!userExists) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Soft delete: desativar o usuário
    await prisma.user.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ message: 'Usuário desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar usuário' },
      { status: 500 }
    );
  }
}

