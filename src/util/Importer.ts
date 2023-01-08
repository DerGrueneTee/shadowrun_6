
export default class Importer {

    static async pasteEventhandler(e) {
        //let rawData = e.clipboardData.getData("text");
        let rawData = "";

        if (e instanceof ClipboardEvent) {
            rawData = (e as ClipboardEvent).clipboardData!.getData("text");
        } else {
            rawData = await navigator.clipboard.readText();
        }
/*        rawData = rawData.replace(/\r\n/g, "\n");
        rawData = rawData.replace(/-\n/g, "");
        rawData = rawData.replace(//g, "");
*/        console.log(rawData);
	}
}