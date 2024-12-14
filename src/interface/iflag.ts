import { SourlyFlags } from "..";

export default interface IFlags {
	setFlags: (flags: SourlyFlags) => number;
	getFlags: () => SourlyFlags;
	//operations
	//only use these if you want to set the flags, do not use just for peeking
	xor: (flag: SourlyFlags) => IFlags;
	or: (flag: SourlyFlags) => IFlags;
	and: (flag: SourlyFlags) => IFlags;
	not: () => IFlags;
}
