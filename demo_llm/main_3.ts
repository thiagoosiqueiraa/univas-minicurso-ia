import "dotenv/config";

type Message = {
    role: "user" | "assistant";
    content: string;
};

type ChatCompletion = {
    choices?: Array<{
        message?: { content?: string | null };
    }>;
};

async function main() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL;

    if (!apiKey || !model) {
        throw new Error("Defina OPENROUTER_API_KEY e OPENROUTER_MODEL no arquivo .env");
    }

    // A API não guarda a conversa: cada chamada recebe novamente este histórico.
    const messages: Message[] = [];

    async function conversar(pergunta: string) {
        messages.push({ role: "user", content: pergunta });

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ model, messages }),
        });

        if (!response.ok) {
            throw new Error(`OpenRouter error: ${response.status} ${response.statusText}`);
        }

        const output = (await response.json()) as ChatCompletion;
        const answer = output.choices?.[0]?.message?.content;

        if (!answer) {
            throw new Error("A resposta do modelo não contém texto.");
        }

        messages.push({ role: "assistant", content: answer });
        console.log(`Usuário: ${pergunta}\nIA: ${answer}\n`);
    }

    await conversar("Meu nome é Thiago.");
    await conversar("Qual é o meu nome?");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
