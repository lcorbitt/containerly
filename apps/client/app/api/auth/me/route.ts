import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getToken } from 'next-auth/jwt';
import { User } from '@containerly/common';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });

    if (!token?.accessToken) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await axios.get<User>(
      `${API_URL}/auth/me`,
      {
        headers: {
          'Authorization': `Bearer ${token.accessToken}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || 'Failed to get user';
      return NextResponse.json(
        { message },
        { status }
      );
    }

    return NextResponse.json(
      { message: 'Failed to get user' },
      { status: 500 }
    );
  }
}

