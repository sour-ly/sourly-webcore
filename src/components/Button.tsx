import { absorb } from '../util/click';
import './styles/button.scss';

type ButtonProps = {
	onClick: () => void;
	style?: React.CSSProperties;
	children: React.ReactNode;
	className?: string;
	disabled?: boolean;
	type: 'solid' | 'outline';
};

export function Button({
	onClick,
	children,
	className,
	disabled,
	type,
	style,
}: ButtonProps) {
	function onClickWrapper(e: React.MouseEvent<HTMLButtonElement>) {
		absorb(e);
		if (disabled) return;
		onClick();
	}

	return (
		<button
			className={`button ${className ?? ''} ${type} ${disabled ? 'disabled' : ''}`}
			style={style}
			onClick={onClickWrapper}
			disabled={disabled}
		>
			{children}
		</button>
	);
}
