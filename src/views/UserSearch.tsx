import { Link } from 'react-router-dom';
import { Authentication } from '../api/auth';
import Input from '../components/Input';
import './styles/usersearch.scss';
import SearchResult from '../components/search/SearchResult';
import { useEffect, useRef, useState } from 'react';
import { APIMethods, APITypes } from '../api/api';


const cooldown = 250;

function UserSearch() {

	const [query, setQuery] = useState('');
	const [results, setResults] = useState<APITypes.User[]>([]);
	const lastCall = useRef<{ abort: AbortController, promise: Promise<any> }>();
	const timeout = useRef<any>();
	const offline = Authentication.getOfflineMode();
	const canQuery = useRef<boolean>(true);

	useEffect(() => {
		if (offline) return;
		if (query.length < 2) {
			setResults([]);
			return;
		}

		if (canQuery.current) {
			if (lastCall.current) {
				lastCall.current.abort.abort();
				lastCall.current = undefined;
			};
			APIMethods.refreshIfFailed(() => {
				const c = APIMethods.searchUser(query, (data) => {
					if ("error" in data) {
						console.error(data.error);
						//do not change resuls incase of error
						return;
					}
					setResults(data);
				})
				lastCall.current = c;
				return c.promise;
			});
			canQuery.current = false;
		}

		if (!timeout.current) {
			timeout.current = setTimeout(() => {
				canQuery.current = true;
				timeout.current = undefined;
			}, cooldown);
		}

		return () => {
			if (lastCall.current) {
				lastCall.current.abort.abort();
				lastCall.current = undefined;
			}
			if (timeout.current) {
				clearTimeout(timeout.current);
				timeout.current = undefined;
			}
		}

	}, [query]);

	if (offline) {
		return (
			<main>
				<h1 style={{ marginBottom: '1rem' }}>UserSearch</h1>
				<div className="search-container">
					<h2>Offline Mode</h2>
					<p>Offline mode is enabled. You can't search for users while offline.</p>
				</div>
			</main>
		)
	}

	return (
		<main className="search">
			<h1 style={{ marginBottom: '1rem' }}>UserSearch</h1>
			<div className="search__container">
				<Input label=" " placeholder="Search for a user" onChange={(e) => { setQuery(e.currentTarget.value) }} />
				<div className="search__results">
					{results.length === 0 && query.length > 2 && <p>No results found</p>}
					{results.map((user) => (
						<SearchResult name={user.name} username={user.username} id={`${user.id}`} />
					))}
				</div>
			</div>
		</main>
	)

}

export default UserSearch;
