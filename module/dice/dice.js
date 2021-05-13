import SR6Roll from "./sr6_roll.js"

export async function doRoll(data, messageData = {}) {
  messageData.flavor = "<h2>" + data.title + "</h2>";
  messageData.speaker = ChatMessage.getSpeaker();

  // Define the inner roll function
  const _roll = (type, form, data) => {

    if (form) {
      data.modifier = parseInt(form.modifier.value);
      data.threshold = parseInt(form.threshold.value);
      data.explode = form.explode.checked;
      data.useWildDie = form.wilddie.checked;
      data.type = type;
      messageData.rollMode = form.rollMode.value;
      data.weapon = false; 
      if (data.modifier > 0) {
        data.formula = data.skill.pool + " + " + data.modifier + "d6";
      } else {
        data.formula = data.skill.pool + "d6";
      }
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
  const _r = await _rollDialog({ data, foo: _roll });
  if (_r) {
    _r.toMessage(messageData);
  }
  return _r;
}

async function _rollDialog({ data, foo } = {}) {

  if (isNaN(data.threshold)) {
    data.threshold = 0;
  }
  if (isNaN(data.explode)) {
    data.explode = false;
  }

  if (isNaN(data.modifier)) {
    data.modifier = 0;
  }
  // Render modal dialog
  let template = "systems/shadowrun6-eden/templates/chat/roll-dialog.html";
  let dialogData = {
    data: data,
    rollModes: CONFIG.Dice.rollModes,
  };
  const html = await renderTemplate(template, dialogData);
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

/***********************************  ATTACK ******************************************* */

export async function doAttackRoll(data, messageData = {}) {
  messageData.flavor = "<h2>" + data.title + "</h2>";
  messageData.speaker = ChatMessage.getSpeaker();

  // Define the inner roll function
  const _roll = (type, form, data) => {

    if (form) {
      data.modifier = parseInt(form.modifier.value);
      data.threshold = parseInt(form.threshold.value);
      data.explode = form.explode.checked;
      data.useWildDie = form.wilddie.checked;
      data.type = type;
      messageData.rollMode = form.rollMode.value;
      data.weapon = data.item ? true : false; 
      if (data.modifier > 0) {
        data.formula = data.skill.pool + " + " + data.modifier + "d6";
      } else {
        data.formula = data.skill.pool + "d6";
      }
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
  const _r = await _attackRollDialog({ data, foo: _roll });
  _r.toMessage(messageData);
  return _r;
}

/**
 * @return {Promise<Roll>}
 * @private
 */
async function _attackRollDialog({ data, foo } = {}) {

  if (isNaN(data.threshold)) {
    data.threshold = 0;
  }
  if (isNaN(data.explode)) {
    data.explode = false;
  }

  if (isNaN(data.modifier)) {
    data.modifier = 0;
  }

  data.defRating= 0;
  if (data.targetId) {
    data.extraText = game.i18n.localize("shadowrun6.roll.attack") + " " + game.actors.get(data.targetId).name + " " + game.i18n.localize("shadowrun6.roll.with") + " " + data.item.name;
    data.defRating = game.actors.get(data.targetId).data.data.derived.defense_rating.pool;
  }
  // Render modal dialog
  let template = "systems/shadowrun6-eden/templates/chat/roll-attack-dialog.html";
  let dialogData = {
    data: data,
    rollModes: CONFIG.Dice.rollModes,
  };
  const html = await renderTemplate(template, dialogData);
  const title = data.title;

let d = new CombatDialog({
  title: title,
  content: html,
  buttons: {
    normal: {
      label: game.i18n.localize("shadowrun6.rollType.normal"),
      callback: html => resolve(foo(0, html[0].querySelector("form"), data))
    }
  },
  default: "normal",
  render: html => console.log("Register interactivity in the rendered dialog"),
  close: () => resolve(null) 
});
  // Create the Dialog window
  return new Promise(resolve => d.render(true));
}

export class CombatDialog extends Dialog{
  activateListeners(html) {
    console.log("foo");
  }
}


