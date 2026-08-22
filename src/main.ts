import { input, confirm, select } from "@inquirer/prompts";

async function main() {
  let choice:
    | "register-pet"
    | "list-pets"
    | "schedule-consultation"
    | "list-consultations"
    | "exit" = "register-pet";

  while (choice != "exit") {
    choice = await select({
      message: "O que deseja fazer?",
      choices: [
        { name: "Registrar Pet", value: "register-pet" },
        { name: "Listar Pets", value: "list-pets" },
        { name: "Agendar Consulta", value: "schedule-consultation" },
        { name: "Listar Consultas", value: "list-consultations" },
        { name: "Sair", value: "exit" },
      ],
    });
  }
}

main();
