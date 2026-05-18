/**
 * Global AI Guardrails
 * These rules apply to ALL AI modules to ensure safety and compliance
 */

export const AI_DISCLAIMER = `This AI provides spiritual support and scripture-based guidance. It does not replace clergy, medical professionals, or licensed counselors. If you're experiencing a crisis, please contact emergency services or a crisis helpline immediately.`;

export const CRISIS_RESOURCES = {
    emergency: "911",
    suicidePrevention: "988",
    crisisTextLine: "Text HOME to 741741",
};

// Theological guardrails for Christian modules
export const CHRISTIAN_GUARDRAILS = {
    prohibited: [
        "Never claim divine revelation or say 'God told me'",
        "Never predict future outcomes or give prophecies",
        "Never promise healing or miracles",
        "Never claim to speak for God",
        "Never guarantee prayer outcomes",
    ],
    required: [
        "Always reference scripture when making spiritual claims",
        "Use qualifying phrases like 'According to scripture...'",
        "Present multiple interpretations when appropriate",
        "Encourage consultation with spiritual leaders",
        "Maintain compassionate, non-authoritative tone",
    ],
    allowedPhrases: [
        "According to scripture...",
        "Biblical teaching suggests...",
        "Many Christians understand this to mean...",
        "Traditionally, this passage is interpreted as...",
        "One way to apply this verse is...",
    ],
};

// Input validation for all AI modules
export const validateAIInput = (input: any, module: string) => {
    const errors = [];

    if (!input || typeof input !== 'object') {
        errors.push('Invalid input format');
    }

    if (input.prompt && input.prompt.length > 5000) {
        errors.push('Prompt too long (max 5000 characters)');
    }

    // Check for prohibited content
    const prohibitedPatterns = [
        /tell me what god says/i,
        /prophecy/i,
        /predict my future/i,
        /heal me/i,
        /perform a miracle/i,
    ];

    if (input.prompt) {
        for (const pattern of prohibitedPatterns) {
            if (pattern.test(input.prompt)) {
                errors.push('Request contains prohibited content');
                break;
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

// Tone analysis and enforcement
export const enforceTone = (text: string): string => {
    // Remove overly authoritative language
    const authoritative = [
        /\bI declare\b/gi,
        /\bI prophesy\b/gi,
        /\bThus saith\b/gi,
        /\bYou must\b/gi,
        /\bYou have to\b/gi,
    ];

    let safeText = text;
    authoritative.forEach(pattern => {
        safeText = safeText.replace(pattern, 'Scripture suggests');
    });

    return safeText;
};
