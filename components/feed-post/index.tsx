import Link from 'next/link';
import twttr from 'twitter-text';
import { Paths } from '@common/constants';
import { Post } from '@common/types';
import { PostActions } from './feed-post-actions';
import { DropdownMenu } from '@components/dropdown-menu';
import { CreateResponseForm } from './create-response-form';
import { useState } from 'react';
import { useIsLoggedIn } from '@common/hooks';
import {
	getTimeSinceDate,
	localizedDateFormat,
	urlJoin,
} from '@common/utils';
import {
	Box,
	Grid,
	Link as MuiLink,
	MenuItem,
	Tooltip,
	Typography,
} from '@mui/material';

interface Props {
	post: Post;
}

export
function FeedPost(props: Props) {
	const { post } = props;
	const [responseOpen, setResponseOpen] = useState(false);
	const isLoggedIn = useIsLoggedIn();

	return (
		<Box sx={{
			borderBottom: '1px solid',
			borderColor: 'text.disabled',
			padding: 1,
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
						<Grid
							item
							xs={1}
						>
							<DropdownMenu>
								{post.isOwner && (
									[
										<Link
											key="a"
											passHref
											shallow
											href="/"
										>
											<MenuItem>Edit</MenuItem>
										</Link>,
										<MenuItem key="b">Abandon Ownership</MenuItem>,
									]
								)}
								<MenuItem>View Point Activity</MenuItem>
								{!post.isOwner && (
									<MenuItem>Mark as Spam</MenuItem>
								)}
							</DropdownMenu>
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
					<CreateResponseForm />
				)}
			</div>
		</Box>
	);
}

function parseContentString(str: string) {
	return twttr.autoLink(str, {
		hashtagUrlBase: '/q=',
		cashtagUrlBase: '/q=',
		usernameUrlBase: '/u/',
		listUrlBase: '/',
		targetBlank: true,
	}).trim().replace(/(?:\r\n|\r|\n)/g, '<br>');
}
