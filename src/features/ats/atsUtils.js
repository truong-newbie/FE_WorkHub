export function formatScore(score) {
    if (score === null || score === undefined || Number.isNaN(Number(score))) {
        return 'Pending';
    }

    return `${Number(score).toFixed(1)}%`;
}

export function getScoreLabel(score) {
    const value = Number(score);
    if (score === null || score === undefined || Number.isNaN(value)) return 'Pending analysis';
    if (value >= 80) return 'Strong match';
    if (value >= 60) return 'Good match';
    if (value >= 40) return 'Partial match';
    return 'Weak match';
}

export function getScoreTone(score) {
    const value = Number(score);
    if (score === null || score === undefined || Number.isNaN(value)) return 'pending';
    if (value >= 80) return 'strong';
    if (value >= 60) return 'good';
    if (value >= 40) return 'partial';
    return 'weak';
}

export function formatConfidence(confidence) {
    return formatScore(confidence);
}

export function getRecommendationLabel(recommendation) {
    if (recommendation === 'PASS') return 'Pass';
    if (recommendation === 'CONSIDER') return 'Consider';
    if (recommendation === 'REJECT') return 'Reject';
    return 'Pending recommendation';
}

export function getRecommendationTone(recommendation) {
    if (recommendation === 'PASS') return 'recommendationPass';
    if (recommendation === 'CONSIDER') return 'recommendationConsider';
    if (recommendation === 'REJECT') return 'recommendationReject';
    return 'recommendationPending';
}

export function getExplanationLabel(status) {
    return status === 'CALCULATED' ? 'AI explanation' : 'Rule-based explanation';
}

export function getExplanationTone(status) {
    return status === 'CALCULATED' ? 'explanationAi' : 'explanationFallback';
}

export function getScreeningSummary(result = {}) {
    return result.summary || result.aiSummary || '';
}

export function toScreeningMap(results = []) {
    return Object.fromEntries(results.map((result) => [String(result.applicationId), result]));
}
