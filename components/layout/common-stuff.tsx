import { LoginModal } from '@components/modals/login.modal';
import { LogoutModal } from '@components/modals/logout.modal';
import { CreatePostModal } from '@components/modals/create-post.modal';
import { BoostPostModal } from '@components/modals/boost-post.modal';
import { Loader } from '@components/loader';
import { Toast } from '@components/toast';
import { useEffect } from 'react';
import { getNotificaitons } from '@common/client/api-calls';
import { pushToastMsgAtom } from '@common/atoms';
import { useSetAtom } from 'jotai';
import { useIsLoggedIn } from '@common/hooks';

export
function CommonStuff() {
	const pushToastMsg = useSetAtom(pushToastMsgAtom);
	const isLoggedIn = useIsLoggedIn();

	useEffect(() => {
		if(!isLoggedIn) {
			return;
		}

		const reset = setTimeout(() => {
			// TODO where should this logic go?
			getNotificaitons()
				.then(notifications => {
					notifications.map(n => pushToastMsg({ message: n.message }));
				});
		}, 1000);
		return () => clearTimeout(reset);
	}, [isLoggedIn]);

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
