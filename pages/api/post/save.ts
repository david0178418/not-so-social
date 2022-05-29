import type { NextApiRequest, NextApiResponse } from 'next';

import { getSession } from 'next-auth/react';

export default
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });

	res.send({ session });
}
