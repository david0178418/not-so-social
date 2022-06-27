import Link from 'next/link';
import { Button, Tooltip } from '@mui/material';
import { Post } from '@common/types';
import { bookmarkPost, unbookmarkPost } from '@common/actions';
import { useState } from 'react';
import { ModalActions } from '@common/constants';
import { useRouter } from 'next/router';
import { BookmarkActiveIcon, BookmarkIcon } from '@components/icons';
import { pushToastMsgAtom } from '@common/atoms';
import { useSetAtom } from 'jotai';
import { truncate } from '@common/utils';

interface Props {
	post: Post;
	isLoggedIn?: boolean;
	size?: 'small' | 'medium' | 'large';
}

export
function BookmarkToggle(props: Props) {
	const {
		post,
		isLoggedIn,
		size = 'medium',
	} = props;
	const [isBookmarked, setIsBookmarked] = useState(!!post.bookmarked);
	const pushToastMsg = useSetAtom(pushToastMsgAtom);
	const {
		pathname,
		query,
	} = useRouter();

	async function toggle() {
		if(!(isLoggedIn && post._id)) {
			return;
		}

		setIsBookmarked(!isBookmarked);

		await post.bookmarked ?
			unbookmarkPost(post._id) :
			bookmarkPost(post._id);

		const shortTitle = truncate(post.title);

		const msg = post.bookmarked ?
			`Removed "${shortTitle}" from bookmarks` :
			`Bookmarked "${shortTitle}"`;

		// TODO Nicer/cleaner way to update this without mutating
		post.bookmarked = !post.bookmarked;

		pushToastMsg(msg);
	}

	const body = (
		<Tooltip title="Bookmark">
			<Button size={size} onClick={toggle}>
				{isBookmarked ? (
					<BookmarkActiveIcon color="primary"/>
				) : (
					<BookmarkIcon color="primary"/>
				)}
			</Button>
		</Tooltip>
	);

	return isLoggedIn ? body : (
		<Link
			shallow
			passHref
			href={{
				pathname,
				query: {
					a: ModalActions.LoginRegister,
					...query,
				},
			}}
		>
			{body}
		</Link>
	);
}
