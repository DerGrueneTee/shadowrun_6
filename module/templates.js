/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {

	const templatePaths = [
		"systems/shadowrun6eden/templates/parts/pc-skills.html",
		];

	console.log(`Load templates`);
	return loadTemplates(templatePaths);
};
