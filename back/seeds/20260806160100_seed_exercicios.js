exports.seed = async function(knex) {
  await knex('exercicios').insert([
    { nome: 'Supino Reto', grupo_muscular: 'Peito' },
    { nome: 'Supino Inclinado com Halteres', grupo_muscular: 'Peito' },
    { nome: 'Puxada Alta', grupo_muscular: 'Costas' },
    { nome: 'Remada Curvada', grupo_muscular: 'Costas' },
    { nome: 'Desenvolvimento com Halteres', grupo_muscular: 'Ombro' },
    { nome: 'Elevação Lateral', grupo_muscular: 'Ombro' },
    { nome: 'Rosca Direta', grupo_muscular: 'Braço' },
    { nome: 'Tríceps Testa', grupo_muscular: 'Braço' },
    { nome: 'Abdominal Supra', grupo_muscular: 'Abdômen' },
    { nome: 'Elevação de Pernas', grupo_muscular: 'Abdômen' },
    { nome: 'Elevação Pélvica', grupo_muscular: 'Glúteo' },
    { nome: 'Agachamento Livre', grupo_muscular: 'Pernas' },
    { nome: 'Leg Press 45', grupo_muscular: 'Pernas' }
  ]);
};