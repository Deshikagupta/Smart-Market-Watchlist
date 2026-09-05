function AttentionBadge({ level }) {
    const normalizedLevel = level?.toUpperCase() || "LOW";

    return (
        <span
            className={`attention-badge attention-${normalizedLevel.toLowerCase()}`}
        >
            {normalizedLevel}
        </span>
    );
}

export default AttentionBadge;