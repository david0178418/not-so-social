import { z } from 'zod';

export
const MongoObjectId = z
	.string()
	.trim()
	.length(24);
