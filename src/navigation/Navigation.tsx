import { useLocation, useNavigate } from 'react-router-dom';
import './styles/navigation.scss';
import React, { ReactNode, useEffect, useState } from 'react';
import { Authentication } from '../api/auth';
import { assets } from '..';

function Link(props: { href: string; children: ReactNode }) {
	const router = useNavigate();

	function navigate(path: string) {
		router(path);
	}

	return <div onClick={() => navigate(props.href)}>{props.children}</div>;
}

function LinkImage(props: { href: string; src: string; alt: string, on: boolean }) {
	const router = useNavigate();

	function navigate(path: string) {
		router(path);
	}

	return (
		<div className={`navigation__row__buttons__button ${props.on && 'active'}`} onClick={() => navigate(props.href)} >
			<img src={props.src} alt={props.alt} />
		</div>
	);
}

function Navigator() {
	const location = useLocation();
	const [current, setCurrent] = useState<string>('');
	const ref = React.createRef<HTMLDivElement>();
	const hover = React.createRef<HTMLDivElement>();

	function handleHover(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		if (hover.current) {
			hover.current.style.setProperty('--opacity', '1');
			hover.current.style.setProperty(
				'--spot',
				`${parseInt((e.target as HTMLElement).getAttribute('datatype-order') || '0')}`,
			);
		}
	}

	function handleExit(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		if (hover.current) {
			hover.current.style.setProperty('--opacity', '0');
			hover.current.style.setProperty(
				'--spot',
				`${parseInt((e.target as HTMLElement).getAttribute('datatype-order') || '0')}`,
			);
		}
	}

	useEffect(() => {
		setCurrent(location.pathname);
	}, [location.pathname]);

	useEffect(() => {
		// code to update the current spot based on location
		if (ref.current) {
			let spot = 0;
			let disable = false;
			switch (current) {
				case '/login':
				case '/':
					spot = 0;
					break;
				case '/signup':
					spot = 1;
					break;
				case '/search':
					spot = 2;
					break;
				default:
					spot = -1;
					disable = true;
					break;
			}
			ref.current.style.setProperty('--spot', `${spot}`);
			ref.current.style.setProperty('--disable', disable ? '0' : '1');
		}
	}, [current]);

	return (
		<nav className="navigation">
			<div className="navigation__row">
				<div className="netscape-box effect" ref={ref} />
				<div className="netscape-box effect-2" ref={hover} />
				{Authentication.getLoggedIn() ? (
					<>
						<Link href="/">
							<div
								className="netscape-box"
								datatype-order={0}
								onMouseEnter={handleHover}
								onMouseLeave={handleExit}
							>
								<span>Home</span>
							</div>
						</Link>
						<div className="netscape-box disabled" datatype-order={1}>
							<span>N/A</span>
						</div>
						<Link href="/search">
							<div className="netscape-box"
								datatype-order={2}
								onMouseEnter={handleHover}
								onMouseLeave={handleExit}
							>
								<span>Search</span>
							</div>
						</Link>


					</>
				) :
					(
						<>
							<Link href="/login">
								<div
									className="netscape-box"
									datatype-order={0}
									onMouseEnter={handleHover}
									onMouseLeave={handleExit}
								>
									<span>Login</span>
								</div>
							</Link>
							<Link href="/signup">
								<div
									className="netscape-box"
									datatype-order={1}
									onMouseEnter={handleHover}
									onMouseLeave={handleExit}
								>
									<span>Sign-Up</span>
								</div>
							</Link>
						</>
					)}
			</div>
			<div className="navigation__row__buttons">
				{Authentication.getLoggedIn() && (
					<LinkImage href="/profile" src={assets.getAsset('ui/user')} alt="home" on={current === '/profile'} />
				)
				}
				<LinkImage href="/settings" src={assets.getAsset('ui/gear')} alt="home" on={current === '/settings'} />
			</div>
		</nav>
	);
}

export default Navigator;
