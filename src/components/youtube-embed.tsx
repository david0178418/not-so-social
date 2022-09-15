interface Props {
	embedId: string;
}

export
function YoutubeEmbed(props: Props) {
	const { embedId } = props;
	return (
		<div className="video-responsive">
			<iframe
				width="100%"
				height="480"
				src={`https://www.youtube.com/embed/${embedId}`}
				frameBorder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
				title="Embedded youtube"
			/>
			<style jsx>{`
				.video-responsive {
					overflow: hidden;
					padding-bottom: 56.25%;
					position: relative;
					height: 0;
				}

				.video-responsive iframe {
					left: 0;
					top: 0;
					height: 100%;
					width: 100%;
					position: absolute;
				}
			`}</style>
		</div>
	);
}
