import shuffleAndPlay from "./shuffle";
import URI = Spicetify.URI;

// if a higher percent of the playlist than this is the same artist, don't do separation
const artistSeparatorThreshold = 1;

const minTrackConfig: ConfigData = {
  name: "minimum track duration (sec)",
  key: "bShuffle:minTrackDuration",
  value: 90
}

const opDelayConfig: ConfigData = {
  name: "shuffle operation delay (ms)",
  key: "bShuffle:opDelay",
  value: 1000
}

type ConfigData = {
  name: string,
  key: string,
  value: number
}

type Config = {
  displayText: string,
  data: ConfigData
}

export const getMinTrackDurationSeconds = () => minTrackConfig.value;
export const getOpDelayMs = () => opDelayConfig.value;
export const getArtistSeparatorThld = () => artistSeparatorThreshold;

const ConfigWindow = (config: Config) => {

  // have to dynamically retrieve this because the React field is not set when the module loads
  const { React } = Spicetify;

  let tempValue = config.data.value;

  function handleChange (e: React.FormEvent<HTMLInputElement>) {
    tempValue = +e.currentTarget.value;
  }

  async function persistConfig() {
    Spicetify.LocalStorage.set(config.data.key, tempValue.toString());
    config.data.value = tempValue;
    const notification = "bShuffle: Updated " + config.displayText + " to " + tempValue;
    console.log(notification);
    Spicetify.showNotification(notification);
  }

  return (
    <>
      <div className="modal fade">
        <p>{config.displayText}</p>
        <input type="number" defaultValue={config.data.value} onChange={handleChange} />
        <button onClick={persistConfig} className="Button-sc-qlcn5g-0 Button-md-buttonPrimary-useBrowserDefaultFocusStyle">Save</button>
      </div>
    </>
  )
}

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

  initSettings(minTrackConfig);
  initSettings(opDelayConfig);

  // have to dynamically retrieve this because the React field is not set when the module loads
  const { React } = Spicetify;

  let settingsContent =
    <>
      <ConfigWindow displayText="Min Song Length (sec)" data={minTrackConfig} />
      <ConfigWindow displayText="Operation Delay (ms)" data={opDelayConfig} />
    </>

  new Spicetify.Menu.Item(
    "bShuffle Settings",
    false,
    () => {
      Spicetify.PopupModal.display({
        title: "bShuffle Settings",
        content: settingsContent
      })
    },
    "shuffle"
  ).register();
}

function initSettings(config: ConfigData) {

  const savedValue = Spicetify.LocalStorage.get(config.key);

  if (savedValue == undefined || savedValue == null) {
    Spicetify.LocalStorage.set(config.key, config.value.toString());
  } else {
    config.value = +savedValue;
  }
}
