import type { PostIdMap } from '@common/types';
import type { ReactNode } from 'react';

import { FeedPost } from '@components/feed-post';
import { isTruthy } from '@common/utils';


import { Post } from '@common/types';

interface Props {
	children?: ReactNode;
	posts: Post[];
	parentPosts: PostIdMap;
	responsePosts: PostIdMap;
}

export
function Feed(props: Props) {
	const {
		children,
		parentPosts,
		posts,
		responsePosts,
	} = props;
	return (
		<div className="baz">
			{children}
			<div className="bar">
				{posts.map(p => (
					<FeedPost
						key={p._id}
						post={p}
						parentPost={parentPosts[p.parentId || '']}
						responses={[responsePosts[p._id || '']].filter(isTruthy)}
					/>
				))}
			</div>
			<style jsx>{`
					.baz {
						display: flex;
						flex-direction: column;
						max-height: 100%;
					}

					.bar {
						overflow: hidden scroll;
						flex: 1;
					}
				`}</style>
		</div>
	);
}
