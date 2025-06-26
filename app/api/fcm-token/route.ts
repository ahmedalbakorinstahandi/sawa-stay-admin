import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { device_token } = await request.json();
    
    if (!device_token) {
      return NextResponse.json(
        { success: false, message: 'Device token is required' },
        { status: 400 }
      );
    }

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization header is required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Here you would typically save the device token to your backend
    // For now, we'll just log it and return success
    console.log('Received FCM token:', device_token);
    console.log('User token:', token);

    // Example: Forward to your backend API
    // const response = await fetch(`${process.env.BACKEND_URL}/admin/device-token`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${token}`,
    //   },
    //   body: JSON.stringify({ device_token })
    // });

    // if (!response.ok) {
    //   throw new Error('Failed to save device token');
    // }

    return NextResponse.json({
      success: true,
      message: 'Device token saved successfully'
    });

  } catch (error) {
    console.error('Error saving FCM token:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
