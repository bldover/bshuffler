import URI = Spicetify.URI;
import shuffleAndPlay from "./shuffle";
import PopupWindow from "./settingsWindow"

export function registerContextMenu() {

    let { Type } = URI;

    let shuffleableTypes = [
        Type.ALBUM,
        // Type.ARTIST,
        // Type.COLLECTION,
        // Type.FOLDER,
        Type.PLAYLIST,
        Type.PLAYLIST_V2
    ];

    function isShuffleable(uris: string[]) {
        let uriType = URI.fromString(uris[0]).type;
        return shuffleableTypes.includes(uriType);
    }

    new Spicetify.ContextMenu.Item(
        "bShuffle",
        async uris => {
            await shuffleAndPlay(uris[0]);
        },
        isShuffleable,
        "shuffle"
    ).register();
}

export function registerSettings() {
    new Spicetify.Menu.Item(
        "bShuffle Settings",
        true,
        async () => {
            Spicetify.ReactDOM.render(PopupWindow);
        }
    ).register();
}
