import { LoginModal } from '@components/modals/login.modal';
import { LogoutModal } from '@components/modals/logout.modal';
import { CreatePostModal } from '@components/modals/create-post.modal';
import { BoostPostModal } from '@components/modals/boost-post.modal';
import { Loader } from '@components/loader';
import { Toast } from '@components/toast';

export
function CommonStuff() {
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
