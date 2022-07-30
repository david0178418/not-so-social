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
const containerStyles = {
	backgroundColor: '#e4e4e4',
	borderBottomLeftRadius: RADIUS,
	borderBottomRightRadius: RADIUS,
	borderTopLeftRadius: RADIUS,
	borderTopRightRadius: RADIUS,
	marginTop: 1,
	paddingBottom: 1,
	paddingTop: 1,
};
const parentStyles = {
	backgroundColor: 'white',
	borderBottom: '1px solid #dedede',
	borderTopLeftRadius: RADIUS,
	borderTopRightRadius: RADIUS,
	marginBottom: '-1px',
	marginX: 2,
	overflow: 'hidden',
	position: 'relative',
};
const childStyles = {
	backgroundColor: 'white',
	borderBottomLeftRadius: RADIUS,
	borderBottomRightRadius: RADIUS,
	borderTop: '1px solid #dedede',
	marginX: 2,
	overflow: 'hidden',
};
const hasNoResponseStyle = {
	borderBottomRightRadius: RADIUS,
	borderBottomLeftRadius: RADIUS,
};
const hasNoParentStyle = {
	borderTopRightRadius: RADIUS,
	borderTopLeftRadius: RADIUS,
};

export
function FeedPost(props: Props) {
	const {
		post,
		responses = [],
		parentPosts = [],
	} = props;
	const [responseOpen, setResponseOpen] = useState(false);
	const isLoggedIn = useIsLoggedIn();

	const appliedStyles = {
		...styles,
		...((!responses.length) ? hasNoResponseStyle : {}),
		...((!parentPosts.length) ? hasNoParentStyle : {}),
	};

	return (
		<Box sx={containerStyles}>
			{parentPosts.map(p => (
				<Box
					key={p._id}
					sx={parentStyles}
					padding={1}
				>
					<Typography>
						Response To:
						<Link href={urlJoin(Paths.Post, p._id)} passHref>
							<Typography
								noWrap
								component={MuiLink}
								title={p.title}
								sx={{
									fontWeight: 'bold',
									display: 'block',
								}}
							>
								{p.title}
							</Typography>
						</Link>
					</Typography>
				</Box>
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
										{(parentPosts.length && !responses.length).toString()}
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
				<Box
					key={p._id}
					sx={childStyles}
					padding={1}
				>
					<Typography>
						Top Response:
						<Link href={urlJoin(Paths.Post, p._id)} passHref>
							<Typography
								noWrap
								component={MuiLink}
								title={p.title}
								sx={{
									fontWeight: 'bold',
									display: 'block',
								}}
							>
								{p.title}
							</Typography>
						</Link>
					</Typography>
				</Box>
			))}
		</Box>
	);
}
