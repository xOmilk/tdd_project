import { input, confirm, select } from "@inquirer/prompts";

async function main() {
  const name = await input({
    message: "What's your name?",
  });

  const language = await select({
    message: "What's your favorite language?",
    choices: [
      { name: "TypeScript", value: "typescript" },
      { name: "Python", value: "python" },
      { name: "Rust", value: "rust" },
    ],
  });

  const happy = await confirm({
    message: `Are you happy with ${language}?`,
  });

  console.log(`Hello ${name}!`);
}

main();
