import "dotenv/config";

async function main () {
    console.log(process.env.OPENROUTER_MODEL);
    const prompt = "Qual é o meu nome?";
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: process.env.OPENROUTER_MODEL,
            messages: [
                { role: "user", content: prompt }

            ]
        })
    });

    if (!response.ok) {
        throw new Error(`OpenRouter error: ${response.status} ${response.statusText}`);
    }

    const output = await response.json();
    console.log(JSON.stringify(output, undefined, "  "));
}

main();