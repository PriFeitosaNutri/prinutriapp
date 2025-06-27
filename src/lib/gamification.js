export const waterPins = [
  { name: "Copo D'água", image: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/cfc8137135797c2c76e460261a3917fe.png", minDays: 0, type: "hydration" },
  { name: "Garrafinha Verde", image: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/7df70d1ce9e50eeace13983d1409ee41.png", minDays: 5, type: "hydration" },
  { name: "Garrafinha Prata", image: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/cd63877cbec706652ee861e22d861d33.png", minDays: 10, type: "hydration" },
  { name: "Garrafinha Ouro", image: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/4e70790e5c4dec4e2e7e22c186bad141.png", minDays: 15, type: "hydration" },
  { name: "Garrafinha Diamante", image: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/1bc184320fb7ca6a7dbbef618bdac15b.png", minDays: 20, type: "hydration" },
];

export const taskPins = [
    { name: "Troféu de Participação", image: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/0cea25a352bab528453876f6b91eb787.png", minWeeks: 0, type: "task" },
    { name: "Troféu Esforçado", image: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/4d2cf4eb2cdfbd447ca38e6aec6fa595.png", minWeeks: 1, type: "task" },
    { name: "Troféu Dedicado", image: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/42705e9e6b19e1f47f9a5c3cf710e6ce.png", minWeeks: 2, type: "task" },
    { name: "Troféu Campeão", image: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/69f457481cefc33a9945ef2971e4dbf9.png", minWeeks: 3, type: "task" },
];

export const orgulhoDaNutriRewards = [
    { name: "Figurinha Orgulho Cinza", image: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/60de778e3cd0a78d0f3f827bdaba332e.png"},
    { name: "Figurinha Orgulho Verde Claro", image: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/0c4dd4d30ca041531bd7b3ae9381b1ae.png"},
    { name: "Figurinha Orgulho Vermelho", image: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/5749555975437bc922fefa6cd3f0bea1.png"},
    { name: "Figurinha Orgulho Verde Escuro", image: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/4f1999aaac4f0ebe62ab5d5ea72bd477.png"},
    { name: "Figurinha Orgulho Preto", image: "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/2bcf173c7ddbcb7d798a632bfb637857.png"},
];

export const getCurrentWeekNumber = () => {
  const today = new Date();
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
  const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};