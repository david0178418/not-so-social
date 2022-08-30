import { Button, Tooltip } from '@mui/material';
import { Post } from '@common/types';
import { bookmarkPost, unbookmarkPost } from '@common/client/api-calls';
import { useState } from 'react';
import { BookmarkActiveIcon, BookmarkIcon } from '@components/icons';
import { pushToastMsgAtom } from '@common/atoms';
import { useSetAtom } from 'jotai';
import { truncate } from '@common/utils';
import { LoginFallbackLink } from '@components/common/login-fallback-link';

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
	const [isBookmarked, setIsBookmarked] = useState(!!post.bookmarkedDate);
	const pushToastMsg = useSetAtom(pushToastMsgAtom);

	async function toggle() {
		if(!(isLoggedIn && post._id)) {
			return;
		}

		// TODO Unwind logic for optimistic update
		setIsBookmarked(!isBookmarked);

		// TODO Bad mutation
		if(post.bookmarkedDate) {
			await unbookmarkPost(post._id);
			delete post.bookmarkedDate;
		} else {
			const result = await bookmarkPost(post._id);
			post.bookmarkedDate = result.data?.date;
		}

		const shortTitle = truncate(post.title);

		const msg = post.bookmarkedDate ?
			`Bookmarked "${shortTitle}"` :
			`Removed "${shortTitle}" from bookmarks` ;

		pushToastMsg(msg);
	}

	return (
		<LoginFallbackLink>
			<Tooltip title="Bookmark">
				<Button size={size} onClick={toggle}>
					{isBookmarked ? (
						<BookmarkActiveIcon color="primary"/>
					) : (
						<BookmarkIcon color="primary"/>
					)}
				</Button>
			</Tooltip>
		</LoginFallbackLink>
	);
}
