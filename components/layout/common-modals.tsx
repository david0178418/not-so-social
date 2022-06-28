import { LoginModal } from '@components/modals/login.modal';
import { LogoutModal } from '@components/modals/logout.modal';
import { CreatePostModal } from '@components/modals/create-post.modal';
import { BoostPostModal } from '@components/modals/boost-post.modal';

export
function CommonModals() {
	return (
		<>
			<LogoutModal />
			<LoginModal />
			<CreatePostModal />
			<BoostPostModal />
		</>
	);
}
