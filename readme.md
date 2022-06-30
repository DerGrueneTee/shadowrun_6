# Shadowrun 6 for Foundry VTT

This is the repository for the Foundry VTT system for the roleplaying system **Shadowrun 6**. It is a non-profit fan project and does not include contents from the publications.

**Installation-URL (Release/Stable):** [https://bitbucket.org/rpgframework-cloud/shadowrun6-eden/downloads/system.json](https://bitbucket.org/rpgframework-cloud/shadowrun6-eden/downloads/system.json) (**Requires Foundry 9.x**)

**Installation-URL (Beta/Unstable ):** [https://bitbucket.org/rpgframework-cloud/shadowrun6-eden/downloads/system-beta.json](https://bitbucket.org/rpgframework-cloud/shadowrun6-eden/downloads/system-beta.json)  (**Requires Foundry 9.x**)

**Installation-URL (Old Stable):** [https://bitbucket.org/rpgframework-cloud/shadowrun6-eden/downloads/system-staging.json](https://bitbucket.org/rpgframework-cloud/shadowrun6-eden/downloads/system-staging.json)  (**Requires Foundry 0.8.x**)

**Documentation:** [Wiki](https://rpgframework.atlassian.net/wiki/spaces/SR6FVTT/),  [Roadmap](https://rpgframework.atlassian.net/wiki/spaces/SR6FVTT/pages/1714421761/Roadmap)

**Discussion:** [Discord](https://discord.gg/USE9Gte)

**For Support:** [Patreon](https://patreon.com/rpgframework)

## Features ##

### Working ###
 * Attributes, Skills and specializations
 * Tracking physical and stun damage
 * Dice rolling (exploding dice and wild die)
 * Importing from Genesis (special Foundry JSON export)
 * German and English language support
 * Edge Tracking
 * Qualities (not their effects though)
 * (since 0.2.x) More derived attributes shown on the "Basics"-Tab
 * (since 0.2.x) An extra page with weapons and the possibility to make attack rolls with them
 * (since 0.2.x) Having selected a target, the weapons attack rating and defense rating are shown in the roll dialog
 * (since 0.2.x) Rolling initiative is working now
 * (since 0.2.x) Compatible with "Dice so Nice"
 * (since 0.2.x) Improve NPC sheet: Have skills on "Overview"-Tab, calculate initiative and actions, allow dice rolls
 * (since 0.3.x) Gear (Bodyware, Chemicals ...)
 * (since 0.3.x) Roll on derived attributes
 * (since 0.4.x) Magic: spells, adept powers, rituals, metamagic
 * (since 0.4.x) Attack and defense rating comparison, gaining edge, spending pre-roll edge
 * (since 0.5.x) Matrix devices, beginning support for edge based rerolls
 * (since 0.5.1) Added machine based translations for several languages 
 * (since 0.6.0) Begin support drones & vehicles, Biography tab
 * (since 0.6.2) Work on a Vehicle Actor has begun
 * (since 0.7.0) Work on a Critter Actor has begun, Added Critter Power Item, Attack rolls from NPC sheet
 * (since 0.7.1) Improvements on roll dialogs, overflow bar, support for defense rolls from chat message
 
### Not working yet ###
 * Auto-calculating modifiers from condition monitors
 * better Critter support, better NPC support
 * Vehicle Actor is unfinished
 
## The future ##
This project currently switches from plain Javascript to Typescript, which means some steps back and cleanup of previous ... dirty implementations.
Unfortunately I must admit, that having this project as a side project to *Genesis* isn't giving me enough time to have a decent development pace. But I try to keep both projects in sync, so the character transfer from Genesis to Foundry VTT works for you.


![Screenshot](screenshots/Screen_2021-06a.jpg)
![Screenshot](screenshots/Screen_2021-06b.jpg)
