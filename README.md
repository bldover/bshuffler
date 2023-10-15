# bShuffler - Bradley's Shuffler

Custom shuffle algorithm for Spotify. Requires Spicetify.

## The Shuffle

- Uses a Fisher-Yates shuffle algorithm to generate the initial scramble.
- Post-processes the shuffle to avoid putting songs by the same artist next to each other.
- Currently supports playlists and albums, with future support for artists and collections. The shuffle is accessible in the "..." context menu for supported types.
- Configurable minimum track length to include in the shuffle, to avoid shuffling skits and miscellaneous non-song tracks.
