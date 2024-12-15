export default interface IEnvironment {
	readonly version: string;
	readonly mode: 'production' | 'development';
	readonly platform: string;
}
