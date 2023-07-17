import { getMinTrackDurationSeconds } from "./shuffleConfig"

type Artist = {
  link: string
}

type PlaylistTrack = {
  link: string,
  artists: Artist[]
}

type PlaylistResponse = {
  items: PlaylistTrack[]
}

export type UriWithArtist = {
  uri: string,
  artist: string
}

export async function getPlaylistTracks(uriId: string): Promise<UriWithArtist[]> {
  let playlist: PlaylistResponse = (await Spicetify.CosmosAsync.get(`sp://core-playlist/v1/playlist/spotify:playlist:${uriId}`, {
    policy: { link: true, playable: true }
  }));
  return playlist.items.map(track => ({uri: track.link, artist: track.artists[0].link}));
}

type AlbumArtist = {
  uri: string
}

type AlbumItem = {
  track: {
    uri: string,
    playability: {
      playable: boolean
    },
    duration: {
      totalMilliseconds: number
    },
    artists: {
      items: AlbumArtist[]
    }
  }
}

type AlbumResponse = {
  playability: {
    playable: boolean
  }
  tracks: {
    items: AlbumItem[]
  }
}

export async function getAlbumTracks(uri: string) {
  const { queryAlbumTracks } = Spicetify.GraphQL.Definitions;
  const { data, errors } = await Spicetify.GraphQL.Request(queryAlbumTracks, { uri, offset: 0, limit: 500 });

  if (errors) {
    throw errors[0].message;
  }

  let albumResponse: AlbumResponse = data.albumUnion;
  if (!albumResponse.playability.playable) {
    return [];
  }

  let urisWithArtists: UriWithArtist[] =
    albumResponse.tracks.items
                 .filter(item => item.track.playability.playable
                            && item.track.duration.totalMilliseconds >= (getMinTrackDurationSeconds() * 1000))
                 .map(item => ({ uri: item.track.uri, artist: item.track.artists.items[0].uri }));
  return urisWithArtists;
}

export async function getArtistTracks(uriId: string) {
  return;
}

export async function getCollectionTracks(uriId: string) {
  return;
}

export async function getFolderTracks(uriId: string) {
  return;
}
