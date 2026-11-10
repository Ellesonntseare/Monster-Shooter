RIFTWATCH — browser co-op shooter

START
Extract the whole folder. Install Node.js 20+ if needed, then double-click START-GAME.cmd.
Open http://localhost:3000. Keep the server window running.
Dependencies and browser libraries are bundled. If node_modules is missing, run npm ci.

PLAY
Choose a hero with left/right arrows before deploying. Each hero has its own health, speed and reload stats.
Select one of six maps. Recover the relay data, clear the hostiles, return to the relay, and hold E to extract.
Campaign has ten sectors; Endless keeps deploying. Refit at the upgrade shop between sectors.

CONTROLS
WASD or arrow keys: move. Mouse: look. Shift: sprint. Space: jump.
Left mouse: fire. Hold right mouse or press C: aim. R: reload.
1 / 2 / Q / mouse wheel: switch weapon. G: throw C4. F: detonate.
E: interact, hold for relay recovery/extraction, pick up a ground gun.
V: shoulder / wide / first-person POV. Esc: pause. M: mute game audio.
If pointer lock is unavailable, use RESUME WITH MOUSE LOOK.

SUPPLIES
Green-cross medkits restore 55 health. Walk over medkits, ammo and power-ups.
Ground M4A1/Laser MG pickups require E; they equip that weapon and give ammunition.
Mystery caches require E. Shields, speed and damage boosts last 20 seconds.
Relaxed difficulty adds regeneration, a deployment shield and gentler damage; Standard is selectable.

FRIENDS
Create a room, share its six-character code, and let friends join before the host selects a map.
Up to four players can choose different heroes. Shared enemies, missions and pickups are host-controlled.
ENABLE VOICE is optional. Microphone access is requested only when clicked. MUTE MIC and LEAVE VOICE are available.
See CLOUDFLARE-SETUP.md for your domain/tunnel and optional TURN relay setup.

MUSIC
Dark Alleys, Dark Times by Section 31, CC0. See MUSIC-CREDITS.md.
Default 9%; the Music slider adjusts 0–30%. Speech reduces music further.

CURRENT LIMITATIONS
The host browser must remain open and active. Host departure closes the room.
No public tunnel/domain or TURN account was configured. A real two-person microphone call remains unverified.
KAI's head/body/limb/grip cosmetic polish and the other heroes' limb/grip visual polish are deferred at your request.
Large imported maps can load slowly and require a capable GPU.

DEVELOPMENT
npm test
Source: public/js/. Server: server.js and multiplayer-server.cjs.
Progress and deferred work: PROGRESS.md. Character assets: CHARACTER-NOTES.md.
