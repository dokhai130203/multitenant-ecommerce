export function getRecencyMultiplier(createdAt: string): number {
    const ageInDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays < 30) return 1.0;
    if (ageInDays < 60) return 0.8;
    if (ageInDays < 90) return 0.6;
    return 0.5;
}

export function getCuratedScore(
    reviewRating: number,
    reviewCount: number,
    createdAt: string,
): number {
    return reviewRating * Math.log1p(reviewCount) * getRecencyMultiplier(createdAt);
}
