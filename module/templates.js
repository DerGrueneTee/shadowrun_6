/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {

	const templatePaths = [
		"systems/shadowrun6-eden/templates/parts/attributes.html",
		"systems/shadowrun6-eden/templates/parts/edge-token.html",
		"systems/shadowrun6-eden/templates/parts/initiatives.html",
		"systems/shadowrun6-eden/templates/parts/attributes-augmented.html",
		"systems/shadowrun6-eden/templates/parts/monitors.html",
		"systems/shadowrun6-eden/templates/parts/npc-attributes.html",
		"systems/shadowrun6-eden/templates/parts/npc-skills.html",
		"systems/shadowrun6-eden/templates/parts/npc-spells.html",
		"systems/shadowrun6-eden/templates/parts/tab-combat.html",
		"systems/shadowrun6-eden/templates/parts/tab-magic.html",
		"systems/shadowrun6-eden/templates/parts/pc-derived.html",
		"systems/shadowrun6-eden/templates/parts/pc-skills.html",
		"systems/shadowrun6-eden/templates/parts/pc-skillvalues.html",
		"systems/shadowrun6-eden/templates/parts/section-adeptpowers.html",
		"systems/shadowrun6-eden/templates/parts/section-ammo.html",
		"systems/shadowrun6-eden/templates/parts/section-armor.html",
		"systems/shadowrun6-eden/templates/parts/section-bodyware.html",
		"systems/shadowrun6-eden/templates/parts/section-gear.html",
		"systems/shadowrun6-eden/templates/parts/section-magicbase.html",
		"systems/shadowrun6-eden/templates/parts/section-martialart.html",
		"systems/shadowrun6-eden/templates/parts/section-metamagics.html",
		"systems/shadowrun6-eden/templates/parts/section-rituals.html",
		"systems/shadowrun6-eden/templates/parts/section-focus.html",
		"systems/shadowrun6-eden/templates/parts/section-qualities.html",
		"systems/shadowrun6-eden/templates/parts/section-skills-action.html",
		"systems/shadowrun6-eden/templates/parts/section-skills-knowledge.html",
		"systems/shadowrun6-eden/templates/parts/section-skills-language.html",
		"systems/shadowrun6-eden/templates/parts/section-soakresist.html",
		"systems/shadowrun6-eden/templates/parts/section-spells.html",
		"systems/shadowrun6-eden/templates/parts/section-weapons.html",
		];

	console.log(`Load templates`);
	return loadTemplates(templatePaths);
};
