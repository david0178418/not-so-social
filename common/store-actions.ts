import { store } from '@common/store';

export
function setToastMsg(toastMsg: string) {
	store.setState({ toastQueuedMessages: [toastMsg] });
}
