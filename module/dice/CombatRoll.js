import SR6Roll from "./sr6_roll.js"
export async function doAttackRoll(data, messageData = {}) {
  messageData.flavor = "<h2>" + data.title + "</h2>";
  messageData.speaker = ChatMessage.getSpeaker();
  messageData.targetId = data.targetId;

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
        data.formula = data.value + " + " + data.modifier + "d6";
      } else {
        data.formula = data.value + "d6";
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

  data.defRating = 0;
  if (data.targetId && data.attackType === "weapon") {
    data.targetName = game.actors.get(data.targetId).name;
    data.extraText = game.i18n.localize("shadowrun6.roll.attack") + " " + data.targetName + " " + game.i18n.localize("shadowrun6.roll.with") + " " + data.item.name;
    data.defRating = game.actors.get(data.targetId).data.data.derived.defense_rating.pool;
  } else if (data.targetId && data.attackType === "spell") {
    data.extraText = " Spell targeting not implemented yet ";
  }
  // Render modal dialog
  let template = "systems/shadowrun6-eden/templates/chat/roll-attack-dialog.html";
  let dialogData = {
    data: data,
    rollModes: CONFIG.Dice.rollModes,
  };
  const html = await renderTemplate(template, dialogData);
  const title = data.title;

  // Create the Dialog window
  return new Promise(resolve => {

    let buttons;
    if (data.buyHits) {
      buttons = {
        bought: {
          label: game.i18n.localize("shadowrun6.rollType.bought"),
          callback: html => resolve(foo(1, html[0].querySelector("form"), data))
        },
        normal: {
          label: game.i18n.localize("shadowrun6.rollType.normal"),
          callback: html => resolve(foo(0, html[0].querySelector("form"), data))
        }
      };
    } else {
      buttons = {
        normal: {
          label: game.i18n.localize("shadowrun6.rollType.normal"),
          callback: html => resolve(foo(0, html[0].querySelector("form"), data))
        }
      };
    }
    new CombatDialog({
      title: title,
      content: html,
      target: data.targetId ? true : false,
      targetName: data.targetName,
      buttons: buttons,
      default: "normal",
      attackType: data.attackType,
      render: html => console.log("Register interactivity in the rendered dialog"),
      close: () => resolve(null)
    }).render(true);
  });
}

export class CombatDialog extends Dialog {

  activateListeners(html) {
    super.activateListeners(html);
    html.find('.calc-edge').show(this._onCalcEdge.bind(this));
    if (!this.data.target) {
      html.find('.calc-edge').show(this._onNoTarget.bind(this));
    }
    html.find('.calc-edge-edit').change(this._onCalcEdge.bind(this));
    html.find('.calc-edge-edit').keyup(this._onCalcEdge.bind(this));
  }

  _onCalcEdge(event) {
    if (this.data.attackType === "weapon") {
      const arElement = document.getElementById("ar");
      const drElement = document.getElementById("dr");
      const dr = drElement.value;
      const ar = arElement.children[arElement.selectedIndex].dataset.itemAr;
      let result = ar - dr;
      let edgeOffsetPlayer = 0;
      let edgeOffsetTarget = 0;
      if (result > 0) {
        edgeOffsetPlayer = Math.min(2, Math.floor(result / 4));
      } else {
        edgeOffsetTarget = Math.min(2, Math.floor((result * -1) / 4));
      }
      if (edgeOffsetPlayer > 0) {
        document.getElementById("edgeLabel").innerText = game.i18n.localize("shadowrun6.roll.edgegain") + edgeOffsetPlayer + " " + game.i18n.localize("shadowrun6.roll.edgegain_player");
      } else if (edgeOffsetTarget > 0) {
        let targetName = this.targetName ? this.targetName : game.i18n.localize("shadowrun6.roll.target");
        document.getElementById("edgeLabel").innerText = game.i18n.localize("shadowrun6.roll.edgegain") + edgeOffsetTarget + " (" + targetName + ")";
      } else {
        document.getElementById("edgeLabel").innerText = game.i18n.localize("shadowrun6.roll.noedgegain");
      }
    } else {
      document.getElementById("edgeLabel").innerText = "Edgegain for spells not implemented yet";
    }
  }

  _onNoTarget() {
    document.getElementById("noTargetLabel").innerText = game.i18n.localize("shadowrun6.roll.notarget");
  }
}