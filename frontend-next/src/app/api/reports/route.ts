import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, description, image } = body;

    // Here you would typically save the report to your database
    console.log('Received report:', { type, description, hasImage: !!image });

    return NextResponse.json(
      { message: 'Report submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error submitting report:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
