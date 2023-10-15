import { registerContextMenu, registerSettings } from "./shuffleConfig";

// OPTIMIZATIONS
// - update queue as soon as the first 50 tracks are randomized, to avoid delay with large playlists
// -- probably not needed, seems fast enough
// - fix context to be better (use shuffle? where does this go???)
// - avoid clearing any existing queue???

async function initShuffler() {

  // wait a couple seconds for the Spicetify object to finish being initialized
  if (!(Spicetify.React && Spicetify.URI)) {
    setTimeout(initShuffler, 300);
		return;
	}

  registerSettings();
  registerContextMenu();

  console.log("Loaded bShuffler!");
}

export default initShuffler;
