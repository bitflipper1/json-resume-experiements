// scripts/reactive-to-jsonresume.js
/**
 * Convert a Reactive‑Resume JSON object into a JSON‑Resume object.
 * This is a lightweight fallback if you ever need to transform the older format.
 */
export function reactiveToJsonResume(reactive) {
    const jsonResume = {
        basics: {
            name: reactive.basics?.name || '',
            label: reactive.basics?.headline || '',
            email: reactive.basics?.email || '',
            phone: reactive.basics?.phone || '',
            url: reactive.basics?.url?.href || '',
            summary: reactive.basics?.summary || reactive.sections?.summary?.content || '',
            location: {
                address: '',
                postalCode: '',
                city: reactive.basics?.location || '',
                countryCode: '',
                region: ''
            }
        },
        work: (reactive.sections?.experience?.items || []).map(item => ({
            company: item.company || '',
            position: item.position || '',
            website: typeof item.url === 'object' ? item.url.href : '',
            startDate: (item.date?.split(' - ')[0] || '').trim(),
            endDate: (item.date?.split(' - ')[1] || '').trim(),
            summary: stripHtml(item.summary || ''),
            highlights: parseBullets(item.summary || [])
        })),
        volunteer: (reactive.sections?.volunteer?.items || []).map(item => ({
            organization: item.name || '',
            position: item.position || '',
            website: typeof item.url === 'object' ? item.url.href : '',
            startDate: (item.date?.split(' - ')[0] || '').trim(),
            endDate: (item.date?.split(' - ')[1] || '').trim(),
            summary: stripHtml(item.summary || ''),
            highlights: parseBullets(item.summary || [])
        })),
        education: (reactive.sections?.education?.items || []).map(item => ({
            institution: item.institution || '',
            area: item.area || '',
            studyType: item.studyType || '',
            startDate: (item.date?.split(' - ')[0] || '').trim(),
            endDate: (item.date?.split(' - ')[1] || '').trim(),
            gpa: item.score || '',
            courses: []
        })),
        awards: (reactive.sections?.awards?.items || []).map(item => ({
            title: item.title || '',
            date: item.date || '',
            awarder: item.awarder || '',
            summary: stripHtml(item.summary || '')
        })),
        certificates: (reactive.sections?.certifications?.items || []).map(item => ({
            name: item.name || '',
            issuer: item.issuer || '',
            date: item.date || '',
            url: typeof item.url === 'object' ? item.url.href : ''
        })),
        publications: (reactive.sections?.publications?.items || []).map(item => ({
            name: item.name || '',
            publisher: item.publisher || '',
            releaseDate: item.date || '',
            website: typeof item.url === 'object' ? item.url.href : '',
            summary: stripHtml(item.summary || '')
        })),
        skills: (reactive.sections?.skills?.items || []).map(item => ({
            name: item.name || '',
            level: '',
            keywords: item.keywords || []
        })),
        languages: (reactive.sections?.languages?.items || []).map(item => ({
            language: item.name || '',
            fluency: ''
        })),
        interests: (reactive.sections?.interests?.items || []).map(item => ({
            name: item.name || ''
        })),
        references: (reactive.sections?.references?.items || []).map(item => ({
            name: item.name || '',
            reference: stripHtml(item.summary || '')
        })),
        projects: (reactive.sections?.projects?.items || []).map(item => ({
            name: item.name || '',
            description: stripHtml(item.description || ''),
            highlights: parseBullets(item.summary || []),
            startDate: (item.date?.split(' - ')[0] || '').trim(),
            endDate: (item.date?.split(' - ')[1] || '').trim(),
            url: typeof item.url === 'object' ? item.url.href : ''
        })),
        // The JSON‑Resume spec allows a "meta" block; we keep it empty for now.
        meta: {}
    };
    return jsonResume;
}

function stripHtml(html) {
    return html?.replace(/<[^>]*>/g, '').trim() || '';
}

function parseBullets(html) {
    if (!html) return [];
    const matches = html.match(/<li>(.*?)<\/li>/gi);
    if (matches) return matches.map(m => stripHtml(m));
    // fallback – split on newlines if no <li>
    return html.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
}
