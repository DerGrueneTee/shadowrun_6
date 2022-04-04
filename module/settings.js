export const registerSystemSettings = function () {

  /**
   * Track the system version upon which point a migration was last applied
   */
  game.settings.register("shadowrun6-eden", "systemMigrationVersion", {
    name: "System Migration Version",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });

  /**
   * Register resting variants
   */
  game.settings.register("shadowrun6-eden", "maxEdgePerRound", {
    name: "shadowrun6.settings.maxEdgePerRound.name",
    hint: "shadowrun6.settings.maxEdgePerRound.hint",
    scope: "world",
    config: true,
    type: Number,
    default: 2,
    onChange: max => {
      console.log("maxEdgePerRound adjusted to "+max);
      game.shadowrun6.maxEdgePerRound = max;
//      game.actors.forEach(actor => {
//        if (actor.data.type == "character") {
//          actor.prepareData();
//        }
//      });
    }
  });

  /**
   * Adjustable default threshold setting
   */
  game.settings.register("shadowrun6-eden", "defaultThreshold", {
      name: "shadowrun6.settings.defaultThreshold.name",
      hint: "shadowrun6.settings.defaultThreshold.hint",
      scope: "world",
      config: true,
      type: Number,
      default: 3,
      onChange: threshold => {
        console.log("Default Threshold changed to: " + threshold);
        game.shadowrun6.defaultThreshold = threshold;
      }
  });
}
