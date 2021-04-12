/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {

	const templatePaths = [
		"systems/shadowrun6-eden/templates/parts/attributes.html",
		"systems/shadowrun6-eden/templates/parts/attributes-augmented.html",
		"systems/shadowrun6-eden/templates/parts/monitors.html",
		"systems/shadowrun6-eden/templates/parts/npc-attributes.html",
		"systems/shadowrun6-eden/templates/parts/pc-skills.html",
		"systems/shadowrun6-eden/templates/parts/pc-skillvalues.html",
		];

	console.log(`Load templates`);
	return loadTemplates(templatePaths);
};
