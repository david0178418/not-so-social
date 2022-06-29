import type { ReactNode } from 'react';

interface Props {
	header?: ReactNode;
	children: ReactNode;
}

export
function ScrollContent(props: Props) {
	const {
		children,
		header,
	} = props;
	return (
		<div className="baz">
			{header}
			<div className="bar">
				{children}
			</div>
			<style
				// @ts-ignore Error started happening possibly with NextJS
				// v12.2 update. Needd to see what the deal is here
				jsx
			>{`
				.baz {
					display: flex;
					flex-direction: column;
					max-height: 100%;
				}

				.bar {
					overflow: hidden auto;
					flex: 1;
				}
			`}</style>
		</div>
	);
}
