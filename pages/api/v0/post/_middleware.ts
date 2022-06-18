import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export
async function middleware(req: NextRequest) {
	const session = await getToken({
		req,
		secret: process.env.JWT_SECRET,
	});

	if(!session?.user) {
		return new NextResponse(null, { status: 401 });
	}

	// If user is authenticated, continue.
	return NextResponse.next();
}
