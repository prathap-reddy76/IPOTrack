import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUserId } from '@/lib/api-auth';
import { serializeIpo } from '@/lib/serializers';

export async function GET() {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const alerts = await prisma.userAlert.findMany({
      where: { userId },
      include: { ipo: true },
      orderBy: { createdAt: 'desc' },
    });

    const formattedAlerts = alerts.map(alert => ({
      id: alert.id,
      userId: alert.userId,
      ipoId: alert.ipoId,
      ipoSlug: alert.ipo?.slug || null,
      type: alert.type,
      title: alert.title,
      message: alert.message,
      read: alert.read,
      createdAt: alert.createdAt.toISOString(),
      date: alert.createdAt.toISOString(),
      ipo: serializeIpo(alert.ipo),
    }));

    return NextResponse.json(formattedAlerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { alertId, markAllRead } = body;

    if (markAllRead) {
      await prisma.userAlert.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true });
    }

    if (!alertId) {
      return NextResponse.json({ error: 'alertId or markAllRead is required' }, { status: 400 });
    }

    const alert = await prisma.userAlert.findFirst({
      where: { id: alertId, userId },
    });

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    const updatedAlert = await prisma.userAlert.update({
      where: { id: alertId },
      data: { read: true },
    });

    return NextResponse.json(updatedAlert);
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all');

    if (all === 'true') {
      await prisma.userAlert.deleteMany({
        where: { userId },
      });
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: 'id or all=true is required' }, { status: 400 });
    }

    const alert = await prisma.userAlert.findFirst({
      where: { id, userId },
    });

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    await prisma.userAlert.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
