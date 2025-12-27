import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { SignupDto, AuthResponse } from '@containerly/common';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body: SignupDto = await request.json();

    const response = await axios.post<AuthResponse>(
      `${API_URL}/auth/signup`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || 'Signup failed';
      return NextResponse.json(
        { message },
        { status }
      );
    }

    return NextResponse.json(
      { message: 'Signup failed' },
      { status: 500 }
    );
  }
}

