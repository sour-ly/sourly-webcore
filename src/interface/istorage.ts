//something really simple, a higher level abstraction can be written on top of this to make it more useful; however a get and set seems to be a good starting point
export interface IStorage {
	save(key: string, value: any): void;
	get(key: string): any;
}
