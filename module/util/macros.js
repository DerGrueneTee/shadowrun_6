/*
export function skillCheck(skill, options = {}) {
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    actor.rollSkill(skill, options);
}

export function attackCheck(actorId, attack) {
    const actor = game.actors.get(actorId);
    if (!actor) return;
    actor.rollAttack(attack);
}
*/

export function itemCheck(itemType, itemName, actorId = "", itemId = "") {
		  console.log("itemCheck: "+itemId);
    let actor;
    if (actorId)
        actor = game.actors.get(actorId);
    else {
        const speaker = ChatMessage.getSpeaker();
        if (speaker.token) actor = game.actors.tokens[speaker.token];
        if (!actor) actor = game.actors.get(speaker.actor);
    }

    if (actor) {
        let item;
        if (itemId) {
            item = actor.data.items.find(el => el.id === itemId)
            if (!item) {
                item = game.data.items.find(el => el.id === itemId);
                item = actor.data.items.find(el => el.name === item?.name && el.type === item?.type)
            }
        } else {
            item = actor.data.items.find(el => el.name === itemName && el.type === itemType)
        }
		  console.log("Here: "+item);
        if (item) {
            if (item.type === "spell") {
                actor.rollSpell(item);
            }

            if (item.type === "gear" && item.data.data.type=="WEAPON_RANGED") {
                actor.rollAttack(item.id);
            }
        } else {
            ui.notifications.error(game.i18n.localize("shadowrun6.invalidItem"));
        }

    } else {
        ui.notifications.info(game.i18n.localize("shadowrun6.message.pleaseSelectAToken"));
    }


}
