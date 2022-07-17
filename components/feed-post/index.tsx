import Link from 'next/link';
import { Paths } from '@common/constants';
import { Post } from '@common/types';
import { PostActions } from './feed-post-actions';
import { FeedPostResponseForm } from './feed-post-response-form';
import { useState } from 'react';
import { useIsLoggedIn } from '@common/hooks';
import { ParsedContentServer } from '@components/parsed-content.server';
import {
	getTimeSinceDate,
	localizedDateFormat,
	urlJoin,
} from '@common/utils';
import {
	Box,
	Grid,
	Link as MuiLink,
	Tooltip,
	Typography,
} from '@mui/material';
import { LinkPreviews } from '@components/link-previews';

interface Props {
	child?: boolean;
	parent?: boolean;
	parentPosts?: Post[];
	post: Post;
	responses?: Post[];
}

// TODO fix this style mess

const RADIUS = '10px';
const styles = {
	backgroundColor: 'white',
	borderColor: 'text.disabled',
	padding: 1,
	marginX: 1,
};
const parentStyles = {
	backgroundColor: 'white',
	borderTopRightRadius: RADIUS,
	borderTopLeftRadius: RADIUS,
	overflow: 'hidden',
};
const childStyles = {
	backgroundColor: 'white',
	borderBottomRightRadius: RADIUS,
	borderBottomLeftRadius: RADIUS,
	overflow: 'hidden',
};
const hasParentOrResponseStyles = {
	marginTop: 1,
	paddingBottom: 1,
	paddingTop: 1,
	borderTopRightRadius: RADIUS,
	borderTopLeftRadius: RADIUS,
	borderBottomRightRadius: RADIUS,
	borderBottomLeftRadius: RADIUS,
};
const hasParentNoResponseStyle = {
	borderBottomRightRadius: RADIUS,
	borderBottomLeftRadius: RADIUS,
};
const hasResponseNoParentStyle = {
	borderTopRightRadius: RADIUS,
	borderTopLeftRadius: RADIUS,
};

export
function FeedPost(props: Props) {
	const {
		post,
		child,
		parent,
		responses = [],
		parentPosts = [],
	} = props;
	const [responseOpen, setResponseOpen] = useState(false);
	const isLoggedIn = useIsLoggedIn();

	const appliedStyles = {
		...styles,
		...(parent ? parentStyles : {}),
		...(child ? childStyles : {}),
		...((parentPosts.length && !responses.length) ? hasParentNoResponseStyle : {}),
		...((!parentPosts.length && responses.length) ? hasResponseNoParentStyle : {}),
	};
	const appliedContainerStyles = {
		backgroundColor: '#e4e4e4',
		...(!(parent || child) ? hasParentOrResponseStyles : {}),
	};

	const content = (
		<Box sx={appliedContainerStyles}>
			{parentPosts.map(p => (
				<FeedPost
					parent
					key={p._id}
					post={p}
				/>
			))}
			<Box sx={appliedStyles}>
				<div>
					<Box
						sx={{
							cursor: 'pointer',
							fontWeight: 'bold',
						}}
					>
						<Grid
							container
							spacing={2}
							wrap="nowrap"
							justifyContent="center"
							alignItems="center"
						>
							<Grid
								item
								xs
								zeroMinWidth
							>
								<Link href={urlJoin(Paths.Post, post._id)} passHref>
									<Typography
										noWrap
										component={MuiLink}
										variant="body1"
										title={post.title}
										sx={{
											fontWeight: 'bold',
											display: 'block',
										}}
									>
										{post.title}
									</Typography>
								</Link>
							</Grid>
							<Grid
								item
								xs={5}
								sm={4}
								lg={3}
							>
								<Typography
									color="text.secondary"
									sx={{
										fontSize: 14,
										textAlign: 'right',
									}}
								>
									<Link href={urlJoin(Paths.Post, post._id)} passHref>
										<Tooltip title={localizedDateFormat(post.created)} suppressHydrationWarning>
											<strong>
												{getTimeSinceDate(post.created)}
											</strong>
										</Tooltip>
									</Link>
								</Typography>
							</Grid>
						</Grid>
					</Box>
					<Typography
						variant="body1"
						sx={{ mb: 1.5 }}
						style={{ overflowWrap: 'break-word' }}
					>
						<ParsedContentServer>
							{post.body}
						</ParsedContentServer>
					</Typography>
					{!!post.linkPreviews?.length && (
						<LinkPreviews linkPreviews={post.linkPreviews} />
					)}
					<Grid container columns={4} alignItems="flex-end">
						<PostActions
							post={post}
							onCommentClick={() => isLoggedIn && setResponseOpen(!responseOpen)}
						/>
					</Grid>
					{responseOpen && (
						<FeedPostResponseForm
							parentId={post._id as string}
							onClose={() => setResponseOpen(false)}
						/>
					)}
				</div>
			</Box>
			{responses.map(p => (
				<FeedPost
					child
					key={p._id}
					post={p}
				/>
			))}
		</Box>
	);

	if(parent) {
		return (
			// TODO Figure out the proper style inheritance
			<Box
				sx={{
					position: 'relative',
					marginBottom: '-1px',
					borderBottom: '1px solid #dedede',
					marginX: 1,
				}}
			>
				{content}
			</Box>
		);
	} else if(child) {
		return (
			// TODO Figure out the proper style inheritance
			<Box sx={{
				marginTop: '-1px',
				borderTop: '1px solid #dedede',
				marginX: 1,
			}}>
				{content}
			</Box>
		);
	} else {
		return content;
	}
}
