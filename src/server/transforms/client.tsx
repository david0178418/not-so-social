import type {
	AttachmentPostPartial,
	Post,
} from '@common/types';

import { AttachmentPostKeys } from '@common/constants';
import { pick } from '@common/utils';

export
function postToAttachmentPostPartial(post: Post): AttachmentPostPartial {
	return {
		_id: '',
		...pick(post, ...AttachmentPostKeys),
	};
}
