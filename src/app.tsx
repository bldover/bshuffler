async function initShuffler() {

  let { Type } = Spicetify.URI;

  let shuffleableTypes = [
      Type.ALBUM,
      Type.ARTIST,
      Type.COLLECTION,
      Type.FOLDER,
      Type.PLAYLIST,
      Type.PLAYLIST_V2
  ];

  function isShuffleable(uris: string[]) {
    let uriType = Spicetify.URI.fromString(uris[0]).type;
    return shuffleableTypes.includes(uriType);
  }

  async function shuffleAndPlay(uri: string) {
    Spicetify.showNotification("Adding to menu!");
  }

  new Spicetify.ContextMenu.Item(
      "bShuffle",
      async uris => {
        await shuffleAndPlay(uris[0]);
      },
      isShuffleable,
      "shuffle"
  ).register();
  console.log("Loaded bShuffler!");
}

export default initShuffler;
