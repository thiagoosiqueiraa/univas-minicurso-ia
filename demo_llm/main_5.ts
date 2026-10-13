import "dotenv/config";
import { randomBytes } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

type ToolCall = {
    id: string;
    type: "function";
    function: { name: string; arguments: string };
};

type Message =
    | { role: "user"; content: string }
    | { role: "assistant"; content: string | null; tool_calls?: ToolCall[] }
    | { role: "tool"; tool_call_id: string; content: string };

type ChatCompletion = {
    choices?: Array<{
        message?: { content?: string | null; tool_calls?: ToolCall[] };
    }>;
};

async function main() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL;

    if (!apiKey || !model) {
        throw new Error("Defina OPENROUTER_API_KEY e OPENROUTER_MODEL no arquivo .env");
    }

    const directory = await mkdtemp(join(tmpdir(), "demo-tool-arquivo-"));
    const filePath = join(directory, "codigo.txt");

    try {
        const codigo = randomBytes(24).toString("hex");
        await writeFile(filePath, codigo, "utf8");

        const tools = [{
            type: "function",
            function: {
                name: "ler_arquivo",
                description: "Lê o conteúdo de um arquivo local permitido pelo programa.",
                parameters: {
                    type: "object",
                    properties: {
                        caminho: { type: "string", description: "Caminho absoluto do arquivo a ler" },
                    },
                    required: ["caminho"],
                    additionalProperties: false,
                },
            },
        }];

        const messages: Message[] = [{
            role: "user",
            content: `Use a ferramenta ler_arquivo para ler ${filePath} e diga exatamente o código encontrado.`,
        }];

        async function chamarModelo(toolChoice: object | "none") {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ model, messages, tools, tool_choice: toolChoice }),
            });

            if (!response.ok) {
                throw new Error(`OpenRouter error: ${response.status} ${response.statusText}`);
            }

            const output = (await response.json()) as ChatCompletion;
            const message = output.choices?.[0]?.message;
            if (!message) throw new Error("A resposta do modelo não contém mensagem.");
            return message;
        }

        console.log(`Arquivo criado: ${filePath}`);
        console.log("1. Enviando o caminho e a definição da ferramenta à LLM...");
        const first = await chamarModelo({ type: "function", function: { name: "ler_arquivo" } });
        const calls = first.tool_calls;
        if (!calls?.length) throw new Error("O modelo não solicitou a ferramenta ler_arquivo.");

        messages.push({ role: "assistant", content: first.content ?? null, tool_calls: calls });

        for (const call of calls) {
            if (call.function.name !== "ler_arquivo") {
                throw new Error(`Ferramenta desconhecida: ${call.function.name}`);
            }

            let resultado: string;
            try {
                const args = JSON.parse(call.function.arguments) as { caminho?: unknown };
                if (args.caminho !== filePath) {
                    resultado = "Acesso negado: esta demo só permite ler o arquivo criado por ela.";
                } else {
                    resultado = await readFile(filePath, "utf8");
                }
            } catch {
                resultado = "Erro: argumentos inválidos ou arquivo indisponível.";
            }

            console.log(`2. Programa executou ler_arquivo: ${resultado}`);
            messages.push({ role: "tool", tool_call_id: call.id, content: resultado });
        }

        console.log("3. Enviando o resultado da ferramenta à LLM...");
        const final = await chamarModelo("none");
        if (!final.content) throw new Error("A resposta final do modelo não contém texto.");

        console.log(`Resposta final da LLM: ${final.content}`);
        console.log(`Código real no arquivo: ${codigo}`);
        console.log(`A resposta contém o código correto? ${final.content.includes(codigo) ? "Sim" : "Não"}`);
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
