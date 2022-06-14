import { LoginModal } from '@components/modals/login.modal';
import { LogoutModal } from '@components/modals/logout.modal';
import { CreatePostModal } from '@components/modals/create-post.modal';

export
function CommonModals() {
	return (
		<>
			<LoginModal/>
			<LogoutModal/>
			<CreatePostModal/>
		</>
	);
}
