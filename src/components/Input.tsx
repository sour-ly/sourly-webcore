import { useEffect, useState } from 'react';
import './styles/input.scss';

type InputProps = {
	placeholder: string;
	label?: string
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	value?: any;
} & Omit<React.HTMLProps<HTMLInputElement>, 'value'>;

export default function Input({
	placeholder,
	onChange,
	value,
	label,
	...props
}: InputProps) {
	const [val, setVal] = useState(value ?? '');

	useEffect(() => {
		setVal(value ?? '');
	}, [value]);

	useEffect(() => {
		if (val === value || val === undefined) return;
		if (props.type === 'checkbox') {
			onChange && onChange({ currentTarget: { checked: val } } as any);
		} else {
			onChange && onChange({ currentTarget: { value: val } } as any);
		}
	}, [val]);

	if (!label) {
		label = placeholder;
	}

	function _onChange(e: React.ChangeEvent<HTMLInputElement>) {
		if (props.type === 'checkbox') {
			setVal(e.currentTarget.checked);
		} else {
			setVal(e.currentTarget.value);
		}
	}

	return (
		<div className={`input--label ${props.type}`} {...props}>
			<label>{label}</label>
			<input
				type={props.type || 'text'}
				placeholder={placeholder}
				onChange={_onChange}
				value={val}
				checked={val}
			/>
		</div>
	);
}
