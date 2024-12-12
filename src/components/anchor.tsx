
// why do i exist? well because i dont want links to be a tags which changes the page electron is on, not ideal...
export function Anchor({ href, text }: { href: string; text: string }) {
	function openLink() {
		// if the electron object exists, send a message to the electron main process to open the link
	}

	return (
		<a
			href="#"
			onClick={() => {
				window.open(href, '_blank');
			}}
		>
			{text}
		</a>
	);
}
