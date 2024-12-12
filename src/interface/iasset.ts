/* this interface is used to get the asset from the provider and return it to the React Application.
 * this is so because the web application is not aware of the asset and the provider, so using a solution like this is the best way to consistently get the asset from the provider.
 * Before, Sourly-webcore would import the assets through webpack, but now that it is seperate from any packaging tool, this is the best way to get the asset
 */


export type Asset =
	/* UI */
	'ui/exit' |
	'ui/dots' |
	'ui/next' |
	'ui/pencil' |
	'ui/plus' |
	'ui/pfp' |
	/* images */
	'images/welcome-screen-add-goal' |
	'images/welcome-screen-add-goal-popup' |
	'images/welcome-screen-add-skill' |
	'images/welcome-screen-add-skill-popup'

//just a string object
export type Resource = string;

//make sure this is a dictionary of Asset and Resource, every asset should have a resource
export type AssetTree = {
	[key in Asset]: Resource;
}


export default interface IAsset {
	getAsset(asset: Asset): Resource;
}
