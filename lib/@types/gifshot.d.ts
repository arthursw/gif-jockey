declare namespace gifshot {
	function createGIF(object: any, callback:(obj:{image: string, error: any})=> void): any;
}

declare module "gifshot" {
    export = gifshot;
}