import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const spot = await prisma.spot.findUnique({
    where: { id },
    include: {
      images: true,
      reports: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!spot)
    return NextResponse.json({ error: "Spot not found" }, { status: 404 });
  return NextResponse.json(spot);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  const spot = await prisma.spot.update({
    where: { id },
    data: body,
    include: { images: true },
  });
  return NextResponse.json(spot);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await prisma.spot.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
