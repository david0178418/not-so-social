import { Button, Tooltip } from '@mui/material';
import { Post } from '@common/types';
import { bookmarkPost, unbookmarkPost } from '@common/actions';
import { useState } from 'react';
import Link from 'next/link';
import { ModalActions } from '@common/constants';
import { useRouter } from 'next/router';
import { BookmarkActiveIcon, BookmarkIcon } from '@components/icons';
import { pushToastMsgAtom } from '@common/atoms';
import { useSetAtom } from 'jotai';

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
	const pustToastMsg = useSetAtom(pushToastMsgAtom);
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

		const msg = post.bookmarked ?
			'Bookmark removed' :
			'Bookmarked';

		// TODO Nicer/cleaner way to update this without mutating
		post.bookmarked = !post.bookmarked;

		pustToastMsg(msg);
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
