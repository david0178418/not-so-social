import { LoginModal } from '@components/modals/login.modal';
import { LogoutModal } from '@components/modals/logout.modal';
import { CreatePostModal } from '@components/modals/create-post.modal';
import { BoostPostModal } from '@components/modals/boost-post.modal';
import { Loader } from '@components/loader';
import { Toast } from '@components/toast';
import { dismissNotification, getNotificaitons } from '@client/api-calls';
import { pushToastMsgAtom } from '@common/atoms';
import { useSetAtom } from 'jotai';
import { useIsLoggedIn, useTimeout } from '@common/hooks';

export
function CommonStuff() {
	const pushToastMsg = useSetAtom(pushToastMsgAtom);
	const isLoggedIn = useIsLoggedIn();

	useTimeout(() => {
		if(!isLoggedIn) {
			return;
		}

		// TODO where should this logic go?
		getNotificaitons()
			.then(notifications => {
				notifications.map(n => pushToastMsg({
					message: n.message,
					onClose() {
						dismissNotification(n._id);
					},
				}));
			});
	}, 1000);

	return (
		<>
			<LogoutModal />
			<LoginModal />
			<CreatePostModal />
			<BoostPostModal />
			<Toast />
			<Loader />
		</>
	);
}

export default CommonStuff;
