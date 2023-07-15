// if a higher percent of the playlist than this is the same artist, don't do separation
export const artistSeparatorThreshold: number = 1;
export let minTrackDurationMs: number = 90000; // 1.5 minutes

export function setMinTrackDurationMs(duration: number) {
    minTrackDurationMs = duration;
}
