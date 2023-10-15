import * as tracks from "./tracks";
import { UriWithArtist } from "./tracks";
import { getArtistSeparatorThld, getOpDelayMs } from "./shuffleConfig";
import URI = Spicetify.URI;
import ContextTrack = Spicetify.ContextTrack;

// spotify interactions are heavily influenced by shuffle+
// https://github.com/spicetify/spicetify-cli/blob/master/Extensions/shuffle+.js
function shuffleTracks(tracks: UriWithArtist[], uriType: string) {

  const { Type } = URI;

  let currIndex: number = tracks.length, randomIndex;

  // track count of artists in playlist to determine whether to
  // separate songs in the queue with the same artist
  let artistCount: Map<string, number> = new Map();

  // fisher-yates shuffle algorithm
  while (currIndex != 0) {
    randomIndex = Math.floor(Math.random() * currIndex);
    currIndex--;

    [tracks[currIndex], tracks[randomIndex]] = [tracks[randomIndex], tracks[currIndex]];
    let currTrack = tracks[currIndex];
    artistCount.set(currTrack.artist, (artistCount.get(currTrack.artist) ?? 0) + 1);
  }
  artistCount.set(tracks[0].artist, (artistCount.get(tracks[0].artist) ?? 0) + 1);

  const totalTracks = tracks.length;
  let finalTracks: UriWithArtist[];
  if (!(uriType === Type.ARTIST || uriType === Type.ALBUM)
      && Math.max(...artistCount.values()) / totalTracks < getArtistSeparatorThld) {
    finalTracks = separateArtists(tracks);
  } else {
    finalTracks = tracks;
  }

  let shuffledTracks: ContextTrack[] = finalTracks.map(track => ({ uri: track.uri }));
  return shuffledTracks;
}

function separateArtists(tracks: UriWithArtist[]) {

  let finalTracks: UriWithArtist[] = [];
  let songBuffer: UriWithArtist[] = [];

  for (let i = 0; i < tracks.length; i++) {
    let track = tracks[i];
    if (track.artist == finalTracks.at(-1)?.artist) {
      songBuffer.push(track);
    } else {
      finalTracks.push(track);
    }

    // try to insert buffered tracks in the updated queue
    let updated: boolean = true;
    while (updated) {
      let newBuffer: UriWithArtist[] = [];
      updated = false;
      for (let j = 0; j < songBuffer.length; j++) {
        let bufferedTrack = songBuffer[j];
        if (bufferedTrack.artist != finalTracks.at(-1)?.artist) {
          finalTracks.push(bufferedTrack);
          updated = true;
        } else {
          newBuffer.push(bufferedTrack);
        }
      }
      songBuffer = newBuffer;
    }
  }

  // find places for any tracks left in the buffer
  // splice is surely inefficient but whatever
  songBuffer.forEach(track => {
    let placed: boolean = false;
    for (let i = 0; i < finalTracks.length; i++) {
      let prevTrack = finalTracks[i - 1];
      let currTrack = finalTracks[i];

      if (track.artist != currTrack.artist && track.artist != prevTrack?.artist) {
        // insert
        finalTracks.splice(i, 0, track);
        placed = true;
        break;
      }
    }
    if (!placed) {
      // couldn't find a home, just stick it randomly
      let randomIndex = Math.floor(Math.random() * finalTracks.length);
      finalTracks.splice(randomIndex, 0, track);
    }
  });

  return finalTracks;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// adds tracks to the actual queue
async function updateQueue(tracks: ContextTrack[]) {
  const delay = getOpDelayMs();
  await sleep(delay);
  await Spicetify.Platform.PlayerAPI.clearQueue();

  await sleep(delay);
  const uris = tracks.map(track => track.uri);
  uris.push("spotify:delimiter");
  await Spicetify.addToQueue(tracks);
}

// adds tracks to the "up next" queue
// seems to be more consistent with the small delays between calls
async function updateUpNext(tracks: ContextTrack[], uriRaw: string) {
  const delay = getOpDelayMs();
  await sleep(delay);

  Spicetify.Platform.PlayerAPT.getState().shuffle = true;
	const { sessionId } = Spicetify.Platform.PlayerAPI.getState();
	Spicetify.Platform.PlayerAPI.updateContext(sessionId, { uri: uriRaw, url: "context://" + uriRaw });
}

async function shuffleAndPlay(uriRaw: string) {
  Spicetify.showNotification("bShuffling!");

  let uri = URI.fromString(uriRaw);
  let uriId = uri.id;
  let songsRaw;

  if (uriId === undefined) {
    Spicetify.showNotification(`Error: URI ID was undefined while bShuffling ${uri.type}`);
    return;
  }

  songsRaw = URI.isPlaylistV1OrV2(uri) ? await tracks.getPlaylistTracks(uriId)
           : URI.isAlbum(uri) ? await tracks.getAlbumTracks(uriRaw)
           : URI.isArtist(uri) ? await tracks.getArtistTracks(uriId)
           : URI.isCollection(uri) ? await tracks.getCollectionTracks(uriId)
           : URI.isFolder(uri) ? await tracks.getFolderTracks(uriId)
           : undefined;

  if (songsRaw === undefined) {
    Spicetify.showNotification(`Error: bShuffling a ${uri.type} is not yet supported!`);
    return;
  }
  if (!songsRaw.length) {
    Spicetify.showNotification("Error: Did not find any tracks to bShuffle!");
    return;
  }

  let songsShuffled = shuffleTracks(songsRaw, uri.type);
  let firstTrack = songsShuffled.shift();
  if (firstTrack === undefined) {
    Spicetify.showNotification(`bShuffler found no songs`);
    return;
  }

  await Spicetify.Player.playUri(firstTrack.uri);
  Spicetify.showNotification(`bShuffled ${songsShuffled.length + 1} songs`);
  await updateQueue(songsShuffled)
  await updateUpNext(songsShuffled, uriRaw);
}

export default shuffleAndPlay;
