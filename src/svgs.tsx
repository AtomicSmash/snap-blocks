import type { SVGProps } from "react";

export function DownArrow(props: SVGProps<SVGSVGElement>) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
			<path d="m24 30.8-12-12 2.15-2.15L24 26.5l9.85-9.85L36 18.8Z" />
		</svg>
	);
}
