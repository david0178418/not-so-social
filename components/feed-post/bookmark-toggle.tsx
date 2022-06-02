import { IconButton, Tooltip } from '@mui/material';
import { Post } from '@common/types';
import { bookmarkPost, unbookmarkPost } from '@common/actions';
import { useState } from 'react';
import Link from 'next/link';
import { ModalActions } from '@common/constants';
import { useRouter } from 'next/router';
import { BookmarkIcon, BookmarkOutlinedIcon } from '@components/icons';

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
	const {
		pathname,
		query,
	} = useRouter();

	async function toggle() {
		if(!(isLoggedIn && post._id)) {
			return;
		}

		post.bookmarked ?
			unbookmarkPost(post._id) :
			bookmarkPost(post._id);

		setIsBookmarked(!isBookmarked);
	}

	const body = (
		<Tooltip title="Bookmark">
			<IconButton size={size} onClick={toggle}>
				{isBookmarked ? (
					<BookmarkIcon/>
				) : (
					<BookmarkOutlinedIcon/>
				)}
			</IconButton>
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