import { LoginModal } from '@components/modals/login.modal';
import { LogoutModal } from '@components/modals/logout.modal';
import { CreatePostModal } from '@components/modals/create-post.modal';
import { useIsLoggedIn } from '@common/hooks';
import { BoostPostModal } from '@components/modals/boost-post.modal';

export
function CommonModals() {
	const isLoggedIn = useIsLoggedIn();
	return (
		<>
			{isLoggedIn ? (
				<LogoutModal />
			) : (
				<LoginModal />
			)}
			<CreatePostModal />
			<BoostPostModal />
		</>
	);
}
