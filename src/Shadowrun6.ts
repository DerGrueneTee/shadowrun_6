/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

import SR6Roll, { SR6RollChatMessage } from "./SR6Roll.js";
import { registerSystemSettings } from "./settings.js";
import Shadowrun6Combat from "./Shadowrun6Combat.js";
import { Shadowrun6Actor } from "./Shadowrun6Actor.js";
import { Defense, MonitorType, SR6Config } from "./config.js";
import { Shadowrun6ActorSheetPC } from "./sheets/ActorSheetPC.js";
import { Shadowrun6ActorSheetNPC } from "./sheets/ActorSheetNPC.js";
import { Shadowrun6ActorSheetVehicle } from "./sheets/ActorSheetVehicle.js";
//import { Shadowrun6ActorSheetVehicleCompendium } from "./sheets/ActorSheetVehicleCompendium.js";
import { SR6ItemSheet } from "./sheets/SR6ItemSheet.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { defineHandlebarHelper } from "./util/helper.js";
import { PreparedRoll, RollType, SoakType } from "./dice/RollTypes.js";
import { doRoll } from "./Rolls.js";
import EdgeUtil from "./util/EdgeUtil.js";
import { ChatMessageData, ItemData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";
import Shadowrun6Combatant from "./Shadowrun6Combatant.js";
import Shadowrun6CombatTracker from "./Shadowrun6CombatTracker.js";
import { GenesisData } from "./ItemTypes.js";
import Importer from "./util/Importer.js";

const diceIconSelector: string = "#chat-controls .chat-control-icon .fa-dice-d20";

function getData(obj: any): any {
	if ( (game as any).release.generation >= 10) return obj;
	return obj.data;
}
function getRoll(obj: ChatMessage): Roll|null {
	if ( (game as any).release.generation >= 10) return (obj as any).rolls[0];
	return obj.roll;
}
function getSystemData(obj: any): any {
	if ( (game as any).release.generation >= 10) return obj.system;
	return obj.data.data;
}
function getActorData(obj: any): Shadowrun6Actor {
	if ( (game as any).release.generation >= 10) return obj;
	return obj.data;
}

/**
 * Init hook. Called from Foundry when initializing the world
 */
Hooks.once("init", async function () {
	console.log(`Initializing Shadowrun 6 System`);

	CONFIG.debug.hooks = false;
	CONFIG.debug.dice = true;
	CONFIG.SR6 = new SR6Config();

	CONFIG.ChatMessage.documentClass = SR6RollChatMessage;
	CONFIG.Combat.documentClass = Shadowrun6Combat;
	CONFIG.Combatant.documentClass = Shadowrun6Combatant;
	CONFIG.ui.combat = Shadowrun6CombatTracker;
	CONFIG.Actor.documentClass = Shadowrun6Actor;
	CONFIG.Dice.rolls = [SR6Roll];
//	(CONFIG as any).compatibility.mode = 0;
	getData(game).initiative = "@initiative.physical.pool + (@initiative.physical.dicePool)d6";

	registerSystemSettings();

	// Register sheet application classes
	Actors.unregisterSheet("core", ActorSheet);
	Actors.registerSheet("shadowrun6-eden", Shadowrun6ActorSheetPC, { types: ["Player"], makeDefault: true });
	Actors.registerSheet("shadowrun6-eden", Shadowrun6ActorSheetNPC, { types: ["NPC","Critter","Spirit"], makeDefault: true });
	Actors.registerSheet("shadowrun6-eden", Shadowrun6ActorSheetVehicle, { types: ["Vehicle"], makeDefault: true });

	Items.registerSheet("shadowrun6-eden", SR6ItemSheet, {
		types: [
			"gear",
			"martialarttech",
			"martialartstyle",
			"quality",
			"spell",
			"adeptpower",
			"ritual",
			"metamagic",
			"focus",
			"echo",
			"complexform",
			"sin",
			"contact",
			"lifestyle",
			"critterpower"
		],
		makeDefault: true
	});

	preloadHandlebarsTemplates();
	defineHandlebarHelper();
	document.addEventListener('paste', (e) => Importer.pasteEventhandler(e), false);

	// https://discord.com/channels/732325252788387980/915388333125955645/1001455991151394836
	Hooks.once('initREMOVEME', () => {
    if ( (game as any).release.generation >= 10) return;

    Object.defineProperties((game as Game).system, {
        version   : { get: function () { return this.data.version; } },
        initiative: { get: function () { return this.data.initiative; } }
    });

    Object.defineProperties(TokenDocument.prototype, {
        hidden   : { get: function () { return this.data.hidden; } },
        actorData: { get: function () { return this.data.actorData; } },
        actorLink: { get: function () { return this.data.actorLink; } }
    });

    Object.defineProperties(Actor.prototype, {
        system        : { get: function () { return this.data.data; } },
        prototypeToken: { get: function () { return this.data.token; } },
        ownership     : { get: function () { return this.data.permission; } },
    });

    Object.defineProperties(Item.prototype, {
        system: { get: function () { return this.data.data; } },
    });

    globalThis.isEmpty = isObjectEmpty;
});


	Hooks.once("diceSoNiceReady", (dice3d) => {
		dice3d.addSystem({ id: "SR6", name: "Shadowrun 6 - Eden" }, "default");
		dice3d.addDicePreset({
			type  : "d6",
			labels: [
				"",
				"2",
				"3",
				"4",
				"5",
				"6"
				//        "systems/shadowrun6-eden/icons/SR6_D6_5_o.png",
				//        "systems/shadowrun6-eden/icons/SR6_D6_6_o.png"
			],
			bumpMaps: [
				,
				,
				,
				,
				,//        "systems/shadowrun6-eden/icons/SR6_D6_5_o.png",
				//        "systems/shadowrun6-eden/icons/SR6_D6_6_o.png"
			],
			colorset: "SR6_dark",
			system  : "SR6"
		});
		dice3d.addDicePreset({
			type    : "dc",
			labels  : ["systems/shadowrun6-eden/images/EdgeToken.png", "systems/shadowrun6-eden/images/EdgeToken.png"],
			bumpMaps: [,],
			colorset: "SR6_dark",
			system  : "SR6"
		});
		dice3d.addColorset(
			{
				name       : "SR6_light",
				description: "SR 6 Pink",
				category   : "SR6",
				foreground : "#470146",
				background : "#f7c8f6",
				outline    : "#2e2b2e",
				texture    : "none",
				edge       : "#9F8003",
				material   : "glass",
				font       : "Arial Black",
				fontScale  : {
					d6: 1.1,
					df: 2.5
				},
				visibility: "hidden"
			},
			"no"
		);

		dice3d.addColorset(
			{
				name       : "SR6_dark",
				description: "SR 6 Pink Dark",
				category   : "SR6",
				foreground : "#470146",
				background : "#000000",
				outline    : "#2e2b2e",
				texture    : "none",
				edge       : "#470146",
				material   : "metal",
				font       : "Arial Black",
				fontScale  : {
					d6: 1.1,
					df: 2.5
				},
				visibility: "visible"
			},
			"default"
		);
	});

	/*
	 * Change default icon
	 */
	function onCreateItem(item, options, userId) {
		console.log("onCreateItem  " + item.data.type);
		let createData = item.data;
		if (createData.img == "icons/svg/item-bag.svg" && CONFIG.SR6.icons[createData.type]) {
			createData.img = CONFIG.SR6.icons[createData.type].default;
			item.update({ ["img"]: createData.img });
		}

		// If it is a compendium item, copy over text description
		if ((createData.data as GenesisData).genesisID) {
			let actor  : any = getActorData(item);
			let system : any = getSystemData(item);
			let key: string = actor.type + "." + system.genesisID;
			console.log("Item with genesisID - check for " + key);
			if (!(game as Game).i18n.localize(key + "name").startsWith(key)) {
				(createData.data as GenesisData).description = (game as Game).i18n.localize(key + ".desc");
				createData.name = (game as Game).i18n.localize(key + ".name");
				item.update({ ["data.description"]: createData.data.description });
			}
		}

		console.log("onCreateItem: " + createData.img);
	}

	Hooks.on("createItem", (doc, options, userId) => onCreateItem(doc, options, userId));

	Hooks.on("ready", () => {
		// Render a modal on click.
		$(document).on("click", diceIconSelector, (ev) => {
			console.log("diceIconSelector clicked  ", ev);
			ev.preventDefault();
			// Roll and return
			let roll: PreparedRoll = new PreparedRoll();
			roll.pool = 0;
			roll.speaker = ChatMessage.getSpeaker({ actor: this });
			roll.rollType = RollType.Common;
			doRoll(roll);
		});
	});

	Hooks.on("renderShadowrun6ActorSheetPC", (doc, options, userId) => {
		console.log("renderShadowrun6ActorSheetPC hook called", doc);
	});

	Hooks.on("renderShadowrun6ActorSheetVehicle", (app, html, data) => {
		//    console.log("renderShadowrun6ActorSheetVehicle hook called");
		_onRenderVehicleSheet(app, html, data);
	});

	Hooks.on("renderSR6ItemSheet", (app: SR6ItemSheet, html, data: Item) => {
		console.log("renderSR6ItemSheet hook called");
		_onRenderItemSheet(app, html, data);
	});

	Hooks.on("dropCanvasData", (doc, data) => {
		console.log("dropCanvasData hook called", doc);
	});

	/*
	 * Something has been dropped on the HotBar
	 */
	Hooks.on("hotbarDrop", async (bar, data, slot) => {
		console.log("DROP to Hotbar");
		let macroData = {
			name   : "",
			type   : "script",
			img    : "icons/svg/dice-target.svg",
			command: ""
		};

		/*    // For items, memorize the skill check
    if (data.type === "Item") {
      console.log("Item dropped " + data);
      if (data.id) {
        data.data = game.items.get(data.id).data;
      }
      if (data.data) {
        macroData.name = data.data.name;
        macroData.img = data.data.img;

        let actorId = data.actorId || "";

        if (actorId && game.user.isGM) {
          const actorName = game.actors.get(actorId)?.data.name;
          macroData.name += ` (${actorName})`;
        }

        macroData.command = `game.shadowrun6.itemCheck("${data.data.type}","${data.data.name}","${actorId}","${data.data.id}")`;

      }
    };

    if (macroData.command != "" && macroData.name != "") {
      let macro = await Macro.create(macroData, { displaySheet: false });

      game.user.assignHotbarMacro(macro, slot);
    }*/
	});

	Hooks.on("renderChatMessage", function (app: ChatMessage, html: JQuery, data: any) {
		console.log("ENTER renderChatMessage");
		registerChatMessageEdgeListener(this, app, html, data);
		html.on("click", ".chat-edge", (ev) => {
			let event: JQuery.ClickEvent = ev;
			event.preventDefault();
			let roll = $(event.currentTarget);
			let tip = roll.find(".chat-edge-collapsible");
			if (!tip.is(":visible")) {
				tip.slideDown(200);
			} else {
				tip.slideUp(200);
			}
		});
		html.find(".rollable").click((event) => {
			//      const type =  $(event.currentTarget).closestData("roll-type");
			console.log("ENTER renderChatMessage.rollable.click -> event.currentTarget = ", event.currentTarget);
			const dataset : DOMStringMap = event.currentTarget.dataset;

			let actorId : string|undefined = dataset["actorid"];
			let sceneId : string|undefined = dataset["sceneid"];
			let tokenId : string|undefined = dataset["targetid"];

			let actor : Actor | undefined ;
			let token : Token | undefined;

			// If scene and token ID is given, resolve token
			if (sceneId && tokenId) {
				let scene : Scene = (game as Game).scenes![sceneId];
				if (scene) {
					let t1 : TokenDocument|undefined = scene.tokens.get(tokenId);
					console.log("Token ",t1);
				}
			}

			// If we already have a actor that is rolling, that is great.
			// If not, find one
			if (actorId) {
				actor = (game as Game).actors!.get(actorId);
			}
/*			var targetId = ($(event.currentTarget) as any).closestData("targetid");
			/*
			 * If no target was memorized in the button, try to find one from the
			 * actor associated with the player
			 */
			if (!actor) {
				console.log("No target ID found - use characters actor if possible");
				(game as Game).actors!.forEach((item) => {
					if (item.hasPlayerOwner) actor = item;
				});
			}
			console.log("Actor " , actor);
			if (actor) {
				if (!actor.isOwner) {
					console.log("Current user not owner of actor ", actor.data.name);
					return;
				}
			}

			const rollType = dataset.rollType;
			console.log("Clicked on rollable : " + rollType);
			console.log("dataset : ", dataset);
			const threshold: number = parseInt(dataset.defendHits!);
			const damage: number = dataset.damage ? parseInt(dataset.damage) : 0;
			const monitor: number = parseInt(dataset.monitor!);
			console.log("Target actor ", actor);
			console.log("Target actor ", actor!.name);

			switch (rollType) {
				case RollType.Defense:
					/* Avoid being hit/influenced */
					console.log("TODO: call rollDefense with threshold " + threshold);
					if (actor) {
						let defendWith: Defense = dataset.defendWith! as Defense;
						(actor as Shadowrun6Actor).rollDefense(defendWith, threshold, damage);
					}
					break;
				case RollType.Soak:
					/* Resist incoming netto damage */
					console.log("TODO: call rollSoak with threshold " + threshold + " on monitor " + dataset.soakWith);
					if (actor) {
						let soak: SoakType = dataset.soak! as SoakType;
						(actor as Shadowrun6Actor).rollSoak(soak, damage);
					}
					break;
				case RollType.Damage:
					/* Do not roll - just apply damage */
					let monitor: MonitorType = dataset.monitor as MonitorType;
					console.log("TODO: apply " + damage + " on monitor " + dataset.monitor);
					(actor as Shadowrun6Actor).applyDamage(monitor, damage);
					break;
			}
			/*
      if (rollType === RollType.Defense) {
 			const actor = (game as Game).actors!.get(targetId);
      	console.log("Target actor ",actor);
			console.log("TODO: call rollDefense with threshold "+threshold);
			if (actor) {
				let defendWith : Defense = (dataset.defendWith! as Defense);
				let damage     : number  = (dataset.damage)?parseInt(dataset.damage):0;
				(actor as Shadowrun6Actor).rollDefense(defendWith, threshold, damage);
			}
      }
		*/
		});
		html.on("click", ".chat-edge", (event) => {
			event.preventDefault();
			let roll = $(event.currentTarget);
			let tip = roll.find(".chat-edge-collapsible");
			if (!tip.is(":visible")) {
				tip.slideDown(200);
			} else {
				tip.slideUp(200);
			}
		});

		html.on("click", ".chat-edge-post", (event) => {
			event.preventDefault();
			let roll = $(event.currentTarget.parentElement);
			let tip = roll.find(".chat-edge-post-collapsible");
			if (!tip.is(":visible")) {
				tip.slideDown(200);
			} else {
				tip.slideUp(200);
			}
		});
		html.on("click", ".chat-spell", (event) => {
			console.log("chat-spell");
			event.preventDefault();
			let roll = $(event.currentTarget);
			let tip = roll.find(".chat-spell-collapsible");
			if (!tip.is(":visible")) {
				tip.slideDown(200);
			} else {
				tip.slideUp(200);
			}
		});
		console.log("LEAVE renderChatMessage");
	});

	/**
	 * If a player actor is created, change default token settings
	 */
	Hooks.on("preCreateActor", (actor, createData, options, userId) => {
		if (actor.type === "Player") {
			actor.data.token.update({ actorLink: "true" });
			actor.data.token.update({ vision: "true" });
		}
	});

	Hooks.on("preUpdateCombatant", (combatant, createData, options, userId) => {
		console.log("Combatant with initiative " + createData.initiative);
	});

	Hooks.on("preUpdateCombat", (combat, createData, options, userId) => {
		let realCombat : any = getData(combat);
		console.log("Combat with turn " + createData.turn + " in round " + realCombat.round);
	});

	Hooks.on("deleteCombat", (combat, createData, userId) => {
		console.log("End Combat");
	});

	Hooks.once("dragRuler.ready", (SpeedProvider) => {
		class FictionalGameSystemSpeedProvider extends SpeedProvider {
			get colors() {
				return [
					{ id: "walk", default: 0x00ff00, name: "shadowrun6-eden.speeds.walk" },
					{ id: "dash", default: 0xffff00, name: "shadowrun6-eden.speeds.dash" },
					{ id: "run", default: 0xff8000, name: "shadowrun6-eden.speeds.run" }
				];
			}

			getRanges(token) {
				const baseSpeed = 5; //token.actor.data.speed

				// A character can always walk it's base speed and dash twice it's base speed
				const ranges = [
					{ range: 10, color: "walk" },
					{ range: 15, color: "dash" }
				];

				// Characters that aren't wearing armor are allowed to run with three times their speed
				if (!token.actor.data.isWearingArmor) {
					ranges.push({ range: baseSpeed * 3, color: "dash" });
				}

				return ranges;
			}
		}

		// @ts-ignore
		dragRuler.registerSystem("shadowrun6-eden", FictionalGameSystemSpeedProvider);
	});
});

($.fn as any).closestData = function (dataName, defaultValue = "") {
	let value = this.closest(`[data-${dataName}]`)?.data(dataName);
	return value ? value : defaultValue;
};

/* -------------------------------------------- */
function registerChatMessageEdgeListener(event: Event, chatMsg: ChatMessage, html: JQuery, data: ChatMessageData) {
	if (!chatMsg.isOwner) {
		console.log("I am not owner of that chat message from " + (data as any).alias);
		return;
	}
	// React to changed edge boosts and actions
	let boostSelect = html.find(".edgeBoosts");
	let edgeActions = html.find(".edgeActions");
	if (boostSelect) {
		boostSelect.change((event) => EdgeUtil.onEdgeBoostActionChange(event, "POST", chatMsg, html, data));
		boostSelect.keyup((event) => EdgeUtil.onEdgeBoostActionChange(event, "POST", chatMsg, html, data));
	}

	// chatMsg.roll is a SR6Roll
	let btnPerform = html.find(".edgePerform");
	let roll: SR6Roll = getRoll(chatMsg) as SR6Roll;
	if (btnPerform && roll) {
		btnPerform.click((event) => EdgeUtil.peformPostEdgeBoost(chatMsg, html, data, btnPerform, boostSelect, edgeActions));
	}
}

function _onRenderVehicleSheet(application, html, data) {
	console.log("_onRenderVehicleSheet for " + data.actor);
}

function _onRenderItemSheet(sheet: SR6ItemSheet, html: JQuery, item) {
	console.log("_onRenderItemSheet for ", item);
}
