// dicionário PT->EN de termos comuns de exercício, usado pra traduzir a
// busca do admin antes de consultar a API do WorkoutX (que só entende inglês).
// Frases compostas vêm primeiro (e são testadas primeiro), pra "supino reto"
// não virar "flat bench press" em duas traduções separadas erradas.

const FRASES = {
    'supino reto': 'flat bench press',
    'supino inclinado': 'incline bench press',
    'supino declinado': 'decline bench press',
    'levantamento terra': 'deadlift',
    'elevação lateral': 'lateral raise',
    'elevação frontal': 'front raise',
    'elevação pélvica': 'hip thrust',
    'elevação posterior': 'rear delt raise',
    'rosca direta': 'barbell curl',
    'rosca alternada': 'alternating dumbbell curl',
    'rosca martelo': 'hammer curl',
    'rosca scott': 'preacher curl',
    'rosca concentrada': 'concentration curl',
    'tríceps testa': 'skull crusher',
    'tríceps francês': 'french press',
    'tríceps pulley': 'triceps pushdown',
    'tríceps coice': 'triceps kickback',
    'puxada frontal': 'lat pulldown',
    'puxada alta': 'lat pulldown',
    'remada curvada': 'bent over row',
    'remada cavalinho': 't-bar row',
    'remada baixa': 'seated cable row',
    'remada unilateral': 'single arm dumbbell row',
    'agachamento livre': 'barbell squat',
    'agachamento búlgaro': 'bulgarian split squat',
    'cadeira extensora': 'leg extension',
    'cadeira flexora': 'leg curl',
    'cadeira abdutora': 'hip abduction',
    'panturrilha em pé': 'standing calf raise',
    'panturrilha sentado': 'seated calf raise',
    'abdominal supra': 'crunch',
    'abdominal infra': 'reverse crunch',
    'abdominal oblíquo': 'oblique crunch',
    'desenvolvimento militar': 'military press',
    'desenvolvimento com halteres': 'dumbbell shoulder press',
};

const PALAVRAS = {
    'supino': 'bench press',
    'agachamento': 'squat',
    'rosca': 'curl',
    'remada': 'row',
    'puxada': 'pulldown',
    'crucifixo': 'fly',
    'extensão': 'extension',
    'flexão': 'push-up',
    'desenvolvimento': 'press',
    'panturrilha': 'calf raise',
    'abdominal': 'crunch',
    'prancha': 'plank',
    'afundo': 'lunge',
    'avanço': 'lunge',
    'passada': 'lunge',
    'stiff': 'stiff leg deadlift',
    'mergulho': 'dip',
    'encolhimento': 'shrug',
    'barra': 'barbell',
    'halteres': 'dumbbell',
    'halter': 'dumbbell',
    'polia': 'cable',
    'cabo': 'cable',
    'máquina': 'machine',
    'inclinado': 'incline',
    'declinado': 'decline',
    'unilateral': 'single arm',
    'alternado': 'alternating',
    'martelo': 'hammer',
    'coice': 'kickback',
    'abdutora': 'abduction',
    'adutora': 'adduction',
    'glúteo': 'glute',
    'peito': 'chest',
    'costas': 'back',
    'ombro': 'shoulder',
    'braço': 'arm',
    'perna': 'leg',
};

function traduzirTermoBusca(termoOriginal) {
    const termo = termoOriginal.toLowerCase().trim();

    // tenta a frase inteira primeiro (mais precisa)
    if (FRASES[termo]) {
        return FRASES[termo];
    }

    // senão, troca frase por frase dentro do texto (da mais longa pra mais curta)
    let resultado = termo;
    const entradasFrases = Object.entries(FRASES).sort((a, b) => b[0].length - a[0].length);
    for (const [pt, en] of entradasFrases) {
        resultado = resultado.replace(new RegExp(pt, 'gi'), en);
    }

    // por fim, troca palavra por palavra o que sobrou
    const entradasPalavras = Object.entries(PALAVRAS).sort((a, b) => b[0].length - a[0].length);
    for (const [pt, en] of entradasPalavras) {
        resultado = resultado.replace(new RegExp(`\\b${pt}\\b`, 'gi'), en);
    }

    return resultado;
}

module.exports = { traduzirTermoBusca };