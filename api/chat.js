export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { userInput } = req.body;

  const prompt = `
Você é um assistente de alimentação inteligente. A partir do texto a seguir, faça duas coisas:

1. Extraia os seguintes dados do usuário e retorne em JSON:
{
  "cidade": "nome da cidade (ou vazio)",
  "estado": "sigla do estado",
  "pessoas": número de pessoas que vão se alimentar,
  "frequencia": "mensal", "semanal" ou "mista",
  "orcamento": valor numérico total
}

2. Com base nesses dados, sugira 5 receitas criativas e nutritivas adequadas ao número de pessoas e orçamento. Retorne uma lista de **ingredientes totais** usados nessas receitas, agrupados e sem repetir, idealmente balanceados (proteínas, vegetais, grãos, etc).

Importante: não retorne o passo a passo das receitas, apenas os dados em JSON.

Formato da resposta:
{
  "dados": {
    "cidade": "...",
    "estado": "...",
    "pessoas": ...,
    "frequencia": "...",
    "orcamento": ...
  },
  "ingredientes": [
    "arroz", "feijão", "frango", "tomate", ...
  ]
}

Texto do usuário:
${userInput}
  `;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;

    res.status(200).json({ result: reply });
  } catch (error) {
    res.status(500).json({ error: "Erro na chamada da OpenAI", details: error.message });
  }
}
