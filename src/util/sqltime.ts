export function sqltimetojsdate(sqltime: string) {
	const date = new Date(sqltime);
	return {
		toFormattedString: () => getFormattedDate(date),
		date
	}
}

export function getFormattedDate(date: Date): string {
	//if less than 12 hours, show timestamp
	//
	const dTime = Date.now() - date.getTime();

	//less than a hour
	if (dTime < 60 * 1000 * 60) {
		//less than a minute
		if (dTime < 60 * 1000) {
			return 'Just now';
		}
		//return x minute(s) ago
		const diff = Math.floor((Date.now() - date.getTime()) / 1000 / 60);
		return diff.toString() + ' minute(s) ago';
	}
	else if (dTime < 60 * 60 * 12 * 1000) {
		//return x hour(s) ago
		const diff = Math.floor((Date.now() - date.getTime()) / 1000 / 60 / 60);
		return diff.toString() + ' hour(s) ago';
	} else if (Date.now() - date.getTime() > 60 * 60 * 12 * 1000) {
		//HH:MM
		return date.getHours() + ':' + date.getMinutes();
	}
	//if less than a week, show day of the week
	if (dTime < 604800000) {
		//Day
		//less than two days
		if (dTime < 60 * 60 * 24 * 1 * 1000) {
			//Yesterday
			return 'Yesterday';
		}
		return date.getDay().toString() + ' days ago';
	}
	//if less than a year, show month and day
	if (dTime < 31556952000) {
		//MM/DD
		return date.getMonth() + '/' + date.getDate();
	}

	return date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate();
}
