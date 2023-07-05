import equals from "fast-deep-equal";
import { useEffect, useRef, useState } from "react";

export default function useAutoSave(data, blog_id, delay = 1000) {
    const prevData = useRef(data);
    const [saveState, setSaveState] = useState("saved");

    useEffect(() => {
        if (saveState === "saved" && !equals(prevData.current, data)) {
            setSaveState("waitingToSave");
        }
        prevData.current = data;
    }, [saveState, data]);

    const hasDataChanged = saveState === "waitingToSave";
    useEffect(() => {
        if (hasDataChanged) {
            const timeoutId = setTimeout(() => {
                setSaveState("saving");
                setTimeout(() => {
                    console.log("Saving...");
                }, 1000);

            }, delay);

            return () => {
                clearTimeout(timeoutId);
            };
        }
    }, [delay, hasDataChanged]);

    return saveState;
}