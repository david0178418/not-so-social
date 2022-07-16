// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import type { LinkPreviewData } from '@common/types';

import { lookup } from 'node:dns';
import { getLinkPreview } from 'link-preview-js';
import Joi, { ValidationError } from 'joi';
import { MaxPostBodyLength, MinPostBodyLength } from '@common/constants';
import getUrls from 'get-urls';


interface Schema {
	content: string;
}

const schema = Joi.object<Schema>({
	content: Joi
		.string()
		.min(MinPostBodyLength)
		.max(MaxPostBodyLength)
		.required(),
});

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const urls: string[] = [];
	const previews: LinkPreviewData[] = [];

	try {
		const { content } = await schema.validateAsync(req.query);

		getUrls(content).forEach(u => urls.push(u));
	} catch(error: any) {
		return res
			.status(400)
			.send({
				ok: false,
				errors: (error as ValidationError)
					.details
					.map((d: any) => d.message),
			});
	}

	for(const url of urls) {
		try {
			previews.push(
				await getLinkPreview(url, {
					resolveDNSHost,
					followRedirects: 'manual',
					handleRedirects,
				})
			);
		} catch(e) {
			console.error(e);
		}
	}

	res.status(200).json({
		ok: true,
		data: { previews },
	});
}

async function resolveDNSHost(url: string): Promise<string> {
	return new Promise((resolve, reject) => {
		lookup(
			new URL(url).hostname,
			(err, address) => {
				if (err) {
					reject(err);
					return;
				}

				// if address resolves to localhost or '127.0.0.1' library will throw an error
				resolve(address);
			}
		);
	});
}

function handleRedirects(baseURL: string, forwardedURL: string) {
	const urlObj = new URL(baseURL);
	const forwardedURLObj = new URL(forwardedURL);
	if (
		forwardedURLObj.hostname === urlObj.hostname ||
		forwardedURLObj.hostname === 'www.' + urlObj.hostname
	) {
		return true;
	} else {
		return false;
	}
}
