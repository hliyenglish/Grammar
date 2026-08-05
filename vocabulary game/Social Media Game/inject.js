const fs = require('fs');

const vocabFiles = ['nouns.json', 'nouns2.json', 'verbs.json', 'adjectives.json', 'others.json'];
let allVocab = [];

for (const file of vocabFiles) {
    if (fs.existsSync(file)) {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        allVocab = allVocab.concat(data);
    }
}

const phrases = JSON.parse(fs.readFileSync('phrases.json', 'utf8'));

let html = fs.readFileSync('Social_Media_Game.html', 'utf8');

// Replace allVocab array
const vocabStart = html.indexOf('const allVocab = [');
const vocabEnd = html.indexOf('];\r\n\r\nconst phrases = [', vocabStart);
if(vocabStart > -1 && vocabEnd > -1) {
    html = html.substring(0, vocabStart) + 'const allVocab = ' + JSON.stringify(allVocab, null, 2) + html.substring(vocabEnd + 1);
} else {
    // Try \n instead of \r\n
    const vocabEnd2 = html.indexOf('];\n\nconst phrases = [', vocabStart);
    if(vocabStart > -1 && vocabEnd2 > -1) {
        html = html.substring(0, vocabStart) + 'const allVocab = ' + JSON.stringify(allVocab, null, 2) + html.substring(vocabEnd2 + 1);
    } else {
        // Just find next ];
        const vEnd = html.indexOf('];', vocabStart);
        html = html.substring(0, vocabStart) + 'const allVocab = ' + JSON.stringify(allVocab, null, 2) + html.substring(vEnd + 1);
    }
}

// Replace phrases array
const phraseStart = html.indexOf('const phrases = [');
const phraseEnd = html.indexOf('];', phraseStart);
if(phraseStart > -1 && phraseEnd > -1) {
    html = html.substring(0, phraseStart) + 'const phrases = ' + JSON.stringify(phrases, null, 2) + html.substring(phraseEnd + 1);
}

fs.writeFileSync('Social_Media_Game.html', html, 'utf8');
console.log('Injected successfully! Vocab:', allVocab.length, 'Phrases:', phrases.length);
