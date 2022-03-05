export class MagicOrResonanceDefinition {
	magic:boolean;
	resonance:boolean;
	useSpells:boolean;
	usePowers:boolean;
	
	constructor(magic:boolean=false, resonance=false, useSpells=false,usePowers=false) {
		this.magic = magic;
		this.resonance = resonance;
		this.useSpells = useSpells;
		this.usePowers = usePowers;
	}
}

export class SkillDefinition {
	attrib:string;
	useUntrained;
	constructor(attribute, useUntrained) {
		this.attrib = attribute;
		this.useUntrained = useUntrained;
	}
}

export class EdgeBoost {
	cost:number;
	id:string;
	when:string;
	
	constructor(cost:number, id:string, when:string) {
		this.cost = cost;
		this.id = id;
		this.when = when;
	}
}

export class EdgeAction {
	cost:number;
	id:string;
	cat:string;
	skill:string;
	
	constructor(cost:number, id:string, cat:string, skill:string="") {
		this.cost = cost;
		this.id = id;
		this.cat = cat;
		this.skill = skill;
	}
}

export class MatrixAction {
		id:string;
		skill:string;
		spec:string;
		attrib:string;
		illegal:boolean;
		major:boolean;
		outsider:boolean;
		user:boolean;
		admin:boolean;
		opposedAttr1:string;
		opposedAttr2:string;
		threshold:number;

	constructor(id, skill,spec,attrib, illegal,major, outsider,user,admin, attr1, attr2, threshold=0) {
		this.id = id;
		this.skill   = skill;
		this.spec    = spec;
		this.attrib  = attrib;
		this.illegal = illegal;
		this.major   = major;
		this.outsider= outsider;
		this.user    = user;
		this.admin   = admin;
		this.opposedAttr1 = attr1;
		this.opposedAttr2 = attr2;
		this.threshold = threshold;
	}
}

export class Program {
	id:string;
	type:string;
	
	constructor(id, type) {
		this.id = id;
		this.type = type;
	}
}

