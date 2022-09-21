// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import type { LinkPreview, LinkPreviewData } from '@common/types';

import { lookup } from 'node:dns';
import { getLinkPreview } from 'link-preview-js';
import Joi, { ValidationError } from 'joi';
import getUrls from 'get-urls';
import { urlJoin } from '@common/utils';
import { fetchPost } from '@server/queries';
import { postToDbAttachmentPostPartial } from '@server/transforms';
import {
	MaxPostBodyLength,
	MinPostBodyLength,
	MongoIdLength,
	Paths,
} from '@common/constants';

const { HOST = '' } = process.env;
const PostUrlPrefixRegex = new RegExp(`^${urlJoin(HOST, Paths.Post, '/')}`);

const schema = Joi.object({
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
	const previews: LinkPreview[] = [];

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
		const potentialId = url.replace(PostUrlPrefixRegex, '');

		if(potentialId.length === MongoIdLength) {
			const post = await fetchPost(potentialId);

			if(post) {
				previews.push({
					type: 'post',
					post: postToDbAttachmentPostPartial(post),
				});
			}
		} else {
			try {
				const response = await getLinkPreview(url, {
					resolveDNSHost,
					followRedirects: 'manual',
					handleRedirects,
				});

				// @ts-ignore
				if(!(response?.title || response?.description)) {
					return;
				}

				previews.push({
					type: 'link',
					link: response as LinkPreviewData,
				});
			} catch(e) {
				console.error(e);
			}
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
