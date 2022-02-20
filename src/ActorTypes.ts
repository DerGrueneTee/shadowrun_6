export class Attribute {
    base: number;
    mod: number;
    modString: string = "";
    augment: number ;
    pool: number;
}

export class Attributes {
    bod: Attribute = new Attribute();
    agi: Attribute = new Attribute();
    rea: Attribute = new Attribute();
    str: Attribute = new Attribute();
    wil: Attribute = new Attribute();
    log: Attribute = new Attribute();
    int: Attribute = new Attribute();
    cha: Attribute = new Attribute();
    mag: Attribute = new Attribute();
    res: Attribute = new Attribute();
}

export class Monitor {
    mod: number;
    modString: string;
    value: number = 9;
    dmg: number;
    max: number;
}

export class Derived {
    composure : Attribute = new Attribute();
    judge_intentions : Attribute = new Attribute();
    memory : Attribute = new Attribute();
    lift_carry : Attribute = new Attribute();
    matrix_perception : Attribute = new Attribute();
    resist_damage : Attribute = new Attribute();
    resist_toxin : Attribute = new Attribute();
}

export class Initiative {
    base: number;
    mod: number;
    pool: number;
    dice: number;
    diceMod: number;
    dicePool: number;
}

class SkillValue {
    points: Number = 0;
    modifier: number = 0;
}

class Ratings {
		astral  : Attribute = new Attribute();
		matrix  : Attribute = new Attribute();
		physical: Attribute = new Attribute();
		resonance: Attribute = new Attribute();
		social  : Attribute = new Attribute();
		vehicle : Attribute = new Attribute();
}

class Tradition {
		genesisID: string;
		name: string;
		attribute: string = "log"
}

export class SR6Actor {
	attackrating : Ratings = new Ratings();
	defenserating : Ratings = new Ratings();
}

export class Lifeform extends SR6Actor {
	attributes : Attributes = new Attributes();
    physical: Monitor = new Monitor();
    derived : Derived = new Derived();
    initiative : {
        actions : number ;
		physical : Initiative;
        astral : Initiative;
    };
    stun: Monitor = new Monitor();
    overflow: Monitor = new Monitor();
	tradition : Tradition = new Tradition();
}
export interface ILifeform {
    attributes:Attributes;
}

class Player extends Lifeform {
	
} 

export class Vehicle {
    handleOn: number;
}
