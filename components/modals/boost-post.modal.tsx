import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { ClampedNumberInput } from '@components/common/clamped-number-input';
import { useEffect, useState } from 'react';
import { Alert } from '@mui/material';
import { useRefreshPage } from '@common/hooks';
import { useAtom, useSetAtom } from 'jotai';
import { PostCreatePointRatio } from '@common/constants';
import { BoostIcon } from '@components/icons';
import { getBalance, postBoost } from '@common/actions';
import { exec } from '@common/utils';
import {
	boostPostAtom,
	loadingAtom,
	pushToastMsgAtom,
} from '@common/atoms';

export
function BoostPostModal() {
	const pushToastMsg = useSetAtom(pushToastMsgAtom);
	const [post, setPost] = useAtom(boostPostAtom);
	const [balance, setBalance] = useState(1);
	const [points, setPoints] = useState(10);
	const setLoading = useSetAtom(loadingAtom);
	const reload = useRefreshPage();

	const isOwner = !!post?.isOwner;
	const pointSpend = isOwner ? points / PostCreatePointRatio : points;
	const maxSpend = isOwner ? balance * PostCreatePointRatio : points;
	const noBalance = !balance;

	useEffect(() => {
		if(!post) {
			return;
		}

		exec(async () => {
			setLoading(true);
			const b = await getBalance();
			setBalance(b);
			setLoading(false);
		});
	}, [post]);

	async function handleBoostPost() {
		if(!post?._id) {
			return;
		}

		// if(!await confirmSpend(pointSpend, isOwner)) {
		// 	return;
		// }

		try {
			setLoading(true);
			await postBoost(post._id, pointSpend);
			await reload();
			handleClose();
		} catch(e: any) {
			const { errors = ['Something went wrong. Try again.'] } = e;
			errors.map(pushToastMsg);
			console.log(e);
		}

		setLoading(false);
	}

	function handleClose() {
		setPoints(10);
		setPost(null);
	}

	return (
		<Dialog open={!!post} onClose={handleClose}>
			{noBalance && (
				<Alert severity="error">
					No points available.
				</Alert>
			)}
			<DialogTitle>Boost</DialogTitle>
			<DialogContent>
				<DialogContentText>
					<strong>
						{balance.toLocaleString()}pts
					</strong><br/>
					- {pointSpend.toLocaleString()}
				</DialogContentText>
				<DialogContentText>
					<strong>
						{(balance - pointSpend).toLocaleString()}
					</strong> remaining
				</DialogContentText>
				<ClampedNumberInput
					autoFocus
					label="Boost Amount"
					disabled={noBalance}
					min={1}
					max={maxSpend}
					value={points}
					onChange={setPoints}
				/>
			</DialogContent>
			<DialogActions>
				<Button
					color="error"
					onClick={handleClose}
				>
						Cancel
				</Button>
				<Button
					disabled={noBalance || !points}
					color="success"
					endIcon={<BoostIcon/>}
					onClick={handleBoostPost}
				>
						Boost
				</Button>
			</DialogActions>
		</Dialog>
	);
}
