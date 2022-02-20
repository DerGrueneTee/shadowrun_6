export const defineHandlebarHelper = async function() {
	
  Handlebars.registerHelper('attackrating', function (val) {
    return val[0] + "/" +
      ((val[1] != 0) ? val[1] : "-") + "/" +
      ((val[2] != 0) ? val[2] : "-") + "/" +
      ((val[3] != 0) ? val[3] : "-") + "/" +
      ((val[4] != 0) ? val[4] : "-");
  });
  Handlebars.registerHelper('concat', function (op1, op2) {
    return op1 + op2;
  });
  Handlebars.registerHelper('concat3', function (op1, op2, op3) {
    return op1 + op2 + op3;
  });

  Handlebars.registerHelper('ifIn', function (elem, list, options) {
    if (list.indexOf(elem) > -1) {
      return options.fn(this);
    }
    return options.inverse(this);
  });


/*
  Handlebars.registerHelper('skillAttr', getSkillAttribute);
  Handlebars.registerHelper('skillPool', getSkillPool);
  Handlebars.registerHelper('gearSubtype', getSubtypes);
  Handlebars.registerHelper('ritualFeat', getRitualFeatures);
  Handlebars.registerHelper('spellFeat', getSpellFeatures);
  Handlebars.registerHelper('matrixPool', getMatrixActionPool);
*/
/*
	Handlebars.registerHelper('description', function (itemData, type) {
   	let key = type+"."+itemData.genesisID+".desc";
		let name= game.i18n.localize(key);
		if (name==key) {
			return "";
		}
		return name;
  });
*/

  // Allows {if X = Y} type syntax in html using handlebars
  Handlebars.registerHelper("iff", function (a, operator, b, opts) {
    var bool = false;
    switch (operator) {
      case "==":
        bool = a == b;
        break;
      case ">":
        bool = a > b;
        break;
      case "<":
        bool = a < b;
        break;
      case "!=":
        bool = a != b;
        break;
      case '&&':
        bool = a && b;
        break;
      case '||':
        bool = a || b;
        break;
      case "contains":
        if (a && b) {
          bool = a.includes(b);
        } else {
          bool = false;
        }
        break;
      default:
        throw "Unknown operator " + operator;
    }

    if (bool) {
      return opts.fn(this);
    } else {
      return opts.inverse(this);
    }
  });

};