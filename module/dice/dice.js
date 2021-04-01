import SR6Roll from "./sr6_roll.js"

export async function doRoll(data, messageData = {}) {

  messageData.flavor = data.title;
  messageData.speaker = ChatMessage.getSpeaker();

  // Define the inner roll function
  const _roll = (type, form, data) => {

    if (form) {
      data.mod = parseInt(form.modifier.value);
      data.threshold = parseInt(form.threshold.value);
      data.type = type;
      messageData.rollMode = form.rollMode.value;
      data.formula = data.skill.value + "d6";
    }

    // Execute the roll
    let r = new SR6Roll("", data);
    try {
      r.evaluate();
    } catch (err) {
      console.error(err);
      ui.notifications.error(`Dice roll evaluation failed: ${err.message}`);
      return null;
    }
    return r;
  }

  // Create the Roll instance
  console.log("Await start");
  const _r = await _rollDialog({ data, foo: _roll });
  console.log("Await done");
  _r.toMessage(messageData);
  return _r;
}

/**
    * Build a formula for a Shadowrun dice roll.
    * Assumes roll will be valid (e.g. you pass a positive count).
    * @param count The number of dice to roll.
    * @param limit A limit, if any. Negative for no limit.
    * @param explode If the dice should explode on sixes.
    */
async function createFormula(count, limit = -1, explode = false) {
  let formula = `${count}d6`;
  if (explode) {
    formula += 'x6';
  }
  if (limit > 0) {
    formula += `kh${limit}`;
  }

  return `${formula}cs>=5`;
}

/**
 * @return {Promise<Roll>}
 * @private
 */
async function _rollDialog({ data, foo } = {}) {

  if (isNaN(data.threshold)) {
    data.threshold = 3;
  }
  if (isNaN(data.explode)) {
	    data.explode = false;
	  }
  // Render modal dialog
  let template = "systems/shadowrun6-eden/templates/chat/roll-dialog.html";
  let dialogData = {
    data: data,
    rollModes: CONFIG.Dice.rollModes,
  };
  console.log("call renderTemplate");
  const html = await renderTemplate(template, dialogData);
  console.log("called renderTemplate");
  const title = data.title;


  // Create the Dialog window
  return new Promise(resolve => {
    new Dialog({
      title: title,
      content: html,
      buttons: {
        normal: {
          label: game.i18n.localize("shadowrun6.rollType.normal"),
          callback: html => resolve(foo(0, html[0].querySelector("form"), data))
        },
        bought: {
          label: game.i18n.localize("shadowrun6.rollType.bought"),
          callback: html => resolve(foo(1, html[0].querySelector("form"), data))
        }
      },
      default: "normal",
      render: html => console.log("Register interactivity in the rendered dialog"),
      close: () => resolve(null)
    }).render(true);
  });
}


