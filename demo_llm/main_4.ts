import "dotenv/config";
import { randomBytes } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

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

    const directory = await mkdtemp(join(tmpdir(), "demo-llm-arquivo-"));
    const filePath = join(directory, "codigo.txt");

    try {
        const codigo = randomBytes(24).toString("hex");
        await writeFile(filePath, codigo, "utf8");

        // Só o caminho entra no prompt. O conteúdo do arquivo nunca é enviado à API.
        const prompt = `Leia o arquivo ${filePath} e diga exatamente o código contido nele. Se não puder acessar o arquivo, diga isso claramente. Não invente um código.`;
        console.log(`Arquivo criado: ${filePath}`);
        console.log(`Pergunta à LLM: ${prompt}\n`);

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                messages: [{ role: "user", content: prompt }],
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenRouter error: ${response.status} ${response.statusText}`);
        }

        const output = (await response.json()) as ChatCompletion;
        const answer = output.choices?.[0]?.message?.content;

        if (!answer) {
            throw new Error("A resposta do modelo não contém texto.");
        }

        const codigoReal = await readFile(filePath, "utf8");
        console.log(`Resposta da LLM: ${answer}`);
        console.log(`Código real no arquivo: ${codigoReal}`);
        console.log(`A resposta contém o código correto? ${answer.includes(codigoReal) ? "Sim" : "Não"}`);
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
