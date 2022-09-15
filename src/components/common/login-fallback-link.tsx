import Link from 'next/link';
import { ModalActions } from '@common/constants';
import { useRouter } from 'next/router';
import { useIsLoggedIn } from '@common/hooks';

interface Props {
	children: JSX.Element;
}

export
function LoginFallbackLink(props: Props) {
	const { children } = props;
	const isLoggedIn = useIsLoggedIn();
	const {
		pathname,
		query,
	} = useRouter();

	return isLoggedIn ? children : (
		<Link
			shallow
			passHref
			href={{
				pathname,
				query: {
					a: ModalActions.LoginRegister,
					...query,
				},
			}}
		>
			{children}
		</Link>
	);
}
