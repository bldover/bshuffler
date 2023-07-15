import { minTrackDurationMs, setMinTrackDurationMs } from "./settingsHandler";
import React = Spicetify.React;

export default function PopupWindow() {

    const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
        const newValue: number = +e.currentTarget.value;
        if (!Number.isNaN(newValue)) {
            setMinTrackDurationMs(newValue);
        }
    }

    return (
        <>
            <div className="model fade">
                <p>Minimum Track Duration: </p>
                <input type="Text" defaultValue={minTrackDurationMs} onChange={handleChange} />
            </div>
        </>
    )
}
