export function sqltimetojsdate(sqltime: string) {
	const date = new Date(sqltime);
	return {
		toFormattedString: () => getFormattedDate(date),
		date
	}
}

export function getFormattedDate(date: Date): string {
	console.log(Date.now() - date.getTime());
	//if less than 24 hours, show timestamp
	if (Date.now() - date.getTime() < 86400000) {
		//HH:MM
		return date.getHours() + ':' + date.getMinutes();
	}
	//if less than a week, show day of the week
	if (Date.now() - date.getTime() < 604800000) {
		//Day
		return date.getDay().toString();
	}
	//if less than a year, show month and day
	if (Date.now() - date.getTime() < 31556952000) {
		//MM/DD
		return date.getMonth() + '/' + date.getDate();
	}

	return date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate();
}
