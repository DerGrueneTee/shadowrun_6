import { SR6Config } from "./config";

interface SR6ActorSheetData extends ActorSheet.Data {
	config: SR6Config;
}

interface Game {
	config: SR6Config;
	i18n: Localization;
	settings: ClientSettings;
}
