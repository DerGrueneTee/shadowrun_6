/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class Shadowrun6Actor extends Actor {
    /** @Override */
    prepareData() {
        super.prepareData();
        console.log("hallo Welt!");
    }
}
