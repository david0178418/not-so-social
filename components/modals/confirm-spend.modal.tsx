import { PostCreatePointRatio } from '@common/constants';
import { NoOp } from '@common/utils';
import { useAtom } from 'jotai';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from '@mui/material';

export
function ConfirmSpendModal() {
	useAtom();
	const {
		points = 0,
		isSelfSpend = true,
		onCancel = NoOp,
		onConfirm = NoOp,
	} = pointSpendPrompt || {};

	return (
		<Dialog open={!!pointSpendPrompt}>
			<DialogTitle>
				Spend {points.toLocaleString()} points
			</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Spend {points.toLocaleString()} points on this post?<br/>
					{isSelfSpend && `Since this is your post, ${(points * PostCreatePointRatio).toLocaleString()} points will be applied.`}
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button color="error" onClick={onCancel}>
					Cancel
				</Button>
				<Button color="primary" onClick={onConfirm}>
					Ok
				</Button>
			</DialogActions>
		</Dialog>
	);
}
