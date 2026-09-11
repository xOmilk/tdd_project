import { select } from "@inquirer/prompts";
import MemoryDb from "./db/memory.db";
import AnimalService from "./services/animal.service";
import PetOwnerService from "./services/pet-owner.service";
import ScheduleService from "./services/schedule.service";
import {
  listConsultations,
  listPets,
  registerPet,
  scheduleConsultation,
} from "./utils/index";
import Animal from "./entities/animal.entity";

type MenuChoice =
  | "register-pet"
  | "list-pets"
  | "schedule-consultation"
  | "list-consultations"
  | "exit";

async function main() {
  const db = new MemoryDb();
  const animalService = new AnimalService(db);
  const petOwnerService = new PetOwnerService(db);
  const scheduleService = new ScheduleService(db);
  let choice: MenuChoice = "register-pet";

  while (choice !== "exit") {
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

    switch (choice) {
      case "register-pet":
        await registerPet(animalService, petOwnerService);
        break;
      case "list-pets":
        await listPets(animalService, db);
        break;
      case "schedule-consultation":
        await scheduleConsultation(db, scheduleService);
        break;
      case "list-consultations":
        listConsultations(db);
        break;
    }
  }
}

main();
