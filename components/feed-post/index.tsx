import Link from 'next/link';
import { Paths } from '@common/constants';
import { Post } from '@common/types';
import { PostActions } from './feed-post-actions';
import { FeedPostResponseForm } from './feed-post-response-form';
import { useState } from 'react';
import { useIsLoggedIn } from '@common/hooks';
import {
	getTimeSinceDate,
	localizedDateFormat,
	parseContentString,
	urlJoin,
} from '@common/utils';
import {
	Box,
	Grid,
	Link as MuiLink,
	Tooltip,
	Typography,
} from '@mui/material';

interface Props {
	parentPosts?: Post[];
	post: Post;
	responses?: Post[];
}

const RADIUS = '10px';

export
function FeedPost(props: Props) {
	const {
		post,
		responses = [],
		parentPosts = [],
	} = props;
	const [responseOpen, setResponseOpen] = useState(false);
	const isLoggedIn = useIsLoggedIn();


	return (
		<Box sx={{
			backgroundColor: '#e4e4e4',
			borderTopRightRadius: parentPosts.length && RADIUS,
			borderTopLeftRadius: parentPosts.length && RADIUS,
			borderBottomRightRadius: responses.length && RADIUS,
			borderBottomLeftRadius: responses.length && RADIUS,
		}}>
			{parentPosts.map(p => (
				// TODO Figure out the proper style inheritance
				<Box
					key={p._id}
					sx={{
						marginTop: 1,
						marginX: 2,
						paddingTop: 1,
					}}
				>
					<Box sx={{
						backgroundColor: 'white',
						borderTopRightRadius: RADIUS,
						borderTopLeftRadius: RADIUS,
						overflow: 'hidden',
					}}>
						<FeedPost post={p} />
					</Box>
				</Box>
			))}
			<Box sx={{
				backgroundColor: 'white',
				borderBottom: '1px solid',
				borderColor: 'text.disabled',
				padding: 1,
				marginX: (parentPosts.length && responses.length) ? 1 : 0,
			}}>
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
						dangerouslySetInnerHTML={{ __html: parseContentString(post.body) }}
					/>
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
			{!!responses.length && (
				// TODO Figure out the proper style inheritance
				<Box sx={{
					marginX: 2,
					paddingBottom: 1,
				}}>
					<Box sx={{
						backgroundColor: 'white',
						borderBottomRightRadius: RADIUS,
						borderBottomLeftRadius: RADIUS,
						overflow: 'hidden',
					}}>
						{responses.map(p => (
							<FeedPost
								key={p._id}
								post={p}
							/>
						))}
					</Box>
				</Box>
			)}
		</Box>
	);
}
