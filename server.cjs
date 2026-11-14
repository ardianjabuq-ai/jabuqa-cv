require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const GEMINI_API_BASE = process.env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com/v1beta';

function isGermanLang(lang) {
    if (!lang) return false;
    const l = String(lang).toLowerCase().trim();
    return l === 'de' || l === 'ger' || l === 'german' || l.includes('deutsch');
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

function escapeHtml(text) {
    if (text == null) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function translateContent(content, targetLang) {
    if (!GEMINI_API_KEY) {
        throw new Error('Translation configuration missing: GEMINI_API_KEY is not set on the server.');
    }

    const sourceSummary = String(content.summary || '');
    const sourceSkills = String(content.skills || '');
    const sourceLanguages = String(content.languages || '');
    const sourceExperiences = Array.isArray(content.experiences) ? content.experiences : [];
    const sourceEducations = Array.isArray(content.educations) ? content.educations : [];

    const payload = {
        summary: sourceSummary,
        skills: sourceSkills,
        languages: sourceLanguages,
        experiences: sourceExperiences.map(e => ({
            title: String(e.title || ''),
            company: String(e.company || ''),
            period: String(e.period || ''),
            description: String(e.description || '')
        })),
        educations: sourceEducations.map(e => ({
            degree: String(e.degree || ''),
            institution: String(e.institution || ''),
            year: String(e.year || '')
        }))
    };

    const prompt = `Translate the following CV content into ${targetLang}. Preserve all personal names, company names, institution names, dates, periods, qualification identifiers, and contact details verbatim — do not translate or alter them. Do not invent or embellish any content. Translate only descriptive wording (summary, skills, language names/levels, job titles, responsibilities, education qualifications). Return ONLY a valid JSON object with this exact structure, no markdown code blocks, no explanations, no text outside the JSON:

{
  "summary": "...",
  "skills": "...",
  "languages": "...",
  "experiences": [{"title": "...", "company": "...", "period": "...", "description": "..."}],
  "educations": [{"degree": "...", "institution": "...", "year": "..."}]
}

Content to translate:
${JSON.stringify(payload, null, 2)}`;

    const response = await fetch(`${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1 }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Translation provider rejected request (HTTP ${response.status}): ${errorText}`);
    }

    const result = await response.json();
    const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!rawText) {
        throw new Error('Translation provider returned empty response.');
    }

    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let translated;
    try {
        translated = JSON.parse(cleaned);
    } catch (parseErr) {
        throw new Error('Translation provider returned invalid JSON.');
    }

    if (!translated || typeof translated !== 'object') {
        throw new Error('Translation provider returned invalid structure.');
    }

    return {
        summary: String(translated.summary || sourceSummary),
        skills: String(translated.skills || sourceSkills),
        languages: String(translated.languages || sourceLanguages),
        experiences: Array.isArray(translated.experiences) ? translated.experiences.map((e, i) => ({
            title: String(e.title || sourceExperiences[i]?.title || ''),
            company: String(e.company || sourceExperiences[i]?.company || ''),
            period: String(e.period || sourceExperiences[i]?.period || ''),
            description: String(e.description || sourceExperiences[i]?.description || '')
        })) : sourceExperiences,
        educations: Array.isArray(translated.educations) ? translated.educations.map((e, i) => ({
            degree: String(e.degree || sourceEducations[i]?.degree || ''),
            institution: String(e.institution || sourceEducations[i]?.institution || ''),
            year: String(e.year || sourceEducations[i]?.year || '')
        })) : sourceEducations
    };
}
    let rawLang = data.outputLang || data.lang || data.language || 'German';
    let l = String(rawLang).toLowerCase().trim();
    
    // Normalizim i fuqishëm për shkurtesat (DE, FR, IT, EN) dhe emrat e plotë
    let lang = 'German';
    if (l.includes('eng') || l === 'en' || l === 'english') lang = 'English';
    else if (l.includes('fra') || l === 'fr' || l === 'french') lang = 'French';
    else if (l.includes('ita') || l === 'it' || l === 'italian') lang = 'Italian';
    else lang = 'German';

    const texts = {
        'German': {
            profile: '3. PROFIL & FOKUS 2026-2027',
            skills: 'KERNKOMPETENZEN & EXPERTISE',
            exp: '4. BERUFSERFAHRUNG',
            edu: '5. AUSBILDUNG',
            permLabel: 'Status & Rechtliches',
            langLabel: 'Sprachen',
        },
        'English': {
            profile: '3. PROFILE & FOCUS 2026-2027',
            skills: 'CORE COMPETENCIES & EXPERTISE',
            exp: '4. PROFESSIONAL EXPERIENCE',
            edu: '5. EDUCATION',
            permLabel: 'Status & Legal',
            langLabel: 'Languages',
        },
        'French': {
            profile: '3. PROFIL & FOCUS 2026-2027',
            skills: 'COMPÉTENCES CLÉS & EXPERTISE',
            exp: '4. EXPÉRIENCE PROFESSIONNELLE',
            edu: '5. FORMATION',
            permLabel: 'Statut & Légal',
            langLabel: 'Langues',
        },
        'Italian': {
            profile: '3. PROFILO & FOCUS 2026-2027',
            skills: 'COMPETENZE CHIAVE & ESPERIENZA',
            exp: '4. ESPERIENZA PROFESSIONALE',
            edu: '5. FORMAZIONE',
            permLabel: 'Stato & Permesso',
            langLabel: 'Lingue',
        }
    };

    let t = texts[lang];

    const summary = String(data.summary || '');
    const skills = String(data.skills || '');
    const languages = String(data.languages || '');
    const permit = String(data.permit || '');

    let sections = '';

    if (summary) {
        sections += `\n        <h3 style="color: #d52b1e; font-size: 12px; border-bottom: 1px solid #d52b1e; padding-bottom: 3px; margin-top: 10px;">${t.profile}</h3>\n        <p style="margin: 5px 0 10px 0;">${escapeHtml(summary)}</p>\n`;
    }

    if (skills || languages || permit) {
        sections += `\n        <h3 style="color: #d52b1e; font-size: 12px; border-bottom: 1px solid #d52b1e; padding-bottom: 3px; margin-top: 10px;">${t.skills}</h3>\n        <p style="margin: 5px 0 10px 0;">`;
        let parts = [];
        if (skills) parts.push(`<b>Keywords:</b> ${escapeHtml(skills)}`);
        if (languages) parts.push(`<b>${t.langLabel}:</b> ${escapeHtml(languages)}`);
        if (permit) parts.push(`<b>${t.permLabel}:</b> ${escapeHtml(permit)}`);
        sections += parts.join('<br>') + `</p>\n`;
    }

    if (Array.isArray(data.experiences) && data.experiences.length > 0) {
        sections += `\n        <h3 style="color: #d52b1e; font-size: 12px; border-bottom: 1px solid #d52b1e; padding-bottom: 3px; margin-top: 10px;">${t.exp}</h3>\n`;
        data.experiences.forEach(e => {
            if (!e) return;
            sections += `<div style="margin-bottom: 8px;">`;
            let title = String(e.title || '');
            let company = String(e.company || '');
            let period = String(e.period || '');
            let description = String(e.description || '');
            if (title) sections += `<strong>${escapeHtml(title)}</strong>`;
            if (company) sections += `<br><em style="color: #555;">${escapeHtml(company)}</em>`;
            if (period) sections += `<br>${escapeHtml(period)}`;
            if (description) sections += `<br>${escapeHtml(description)}`;
            sections += `</div>\n`;
        });
    }

    if (Array.isArray(data.educations) && data.educations.length > 0) {
        sections += `\n        <h3 style="color: #d52b1e; font-size: 12px; border-bottom: 1px solid #d52b1e; padding-bottom: 3px; margin-top: 10px;">${t.edu}</h3>\n`;
        data.educations.forEach(e => {
            if (!e) return;
            sections += `<div>`;
            let degree = String(e.degree || '');
            let institution = String(e.institution || '');
            let year = String(e.year || '');
            if (degree) sections += `<strong>${escapeHtml(degree)}</strong>`;
            if (institution) sections += `<br><em style="color: #555;">${escapeHtml(institution)}</em>`;
            if (year) sections += ` (${escapeHtml(year)})`;
            sections += `</div>\n`;
        });
    }

    return `\n    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.4; font-size: 11px; padding: 10px;">\n${sections}\n    </div>\n`;
}

app.post('/api/generate-cv', async (req, res) => {
    try {
        const data = req.body;
        const outputLang = data.outputLang || data.lang || data.language || 'German';
        const consent = data.consent === true;

        let translated = {
            summary: String(data.summary || ''),
            skills: String(data.skills || ''),
            languages: String(data.languages || ''),
            experiences: Array.isArray(data.experiences) ? data.experiences : [],
            educations: Array.isArray(data.educations) ? data.educations : []
        };

        // Only call external translation for non-German output, and only with explicit consent
        if (!isGermanLang(outputLang)) {
            if (!consent) {
                return res.status(400).json({
                    success: false,
                    error: 'Consent required: CV text will be sent to Google Gemini for translation. API usage may incur charges.'
                });
            }
            translated = await translateContent(data, outputLang);
        }

        const htmlOutput = generateSwissCVText({
            ...data,
            summary: translated.summary,
            skills: translated.skills,
            languages: translated.languages,
            experiences: translated.experiences,
            educations: translated.educations
        });

        res.json({
            success: true,
            html: htmlOutput,
            sidebar: {
                languages: translated.languages,
                skills: translated.skills
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Swiss CV Studio running at http://localhost:${PORT}`);
});