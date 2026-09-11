import { confirm, input, select } from "@inquirer/prompts";
import Animal from "./entities/animal.entity";
import PetOwner from "./entities/pet-owner.entity";
import ScheduleType from "./types/schedule-type.type";
import Schedule from "./entities/schedule.entity";
import MemoryDb from "./db/memory.db";
import AnimalService from "./services/animal.service";
import PetOwnerService from "./services/pet-owner.service";
import ScheduleService from "./services/schedule.service";

type MenuChoice =
  | "register-pet"
  | "list-pets"
  | "schedule-consultation"
  | "list-consultations"
  | "exit";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

async function registerPet(
  animalService: AnimalService,
  petOwnerService: PetOwnerService,
): Promise<void> {
  const email = await input({ message: "E-mail do responsável:" });
  let petOwner: PetOwner | undefined =
    await petOwnerService.findPetOwnerByEmail(email);

  if (!petOwner) {
    petOwner = await petOwnerService.registerPetOwner({
      name: await input({ message: "Nome do responsável:" }),
      email,
      phone: await input({ message: "Telefone do responsável:" }),
      animals: [],
      schedules: [],
    });
  }

  const animal: Animal = {
    name: await input({ message: "Nome do animal:" }),
    species: await input({ message: "Espécie:" }),
    breed: await input({ message: "Raça:" }),
    birthDate: new Date(
      await input({ message: "Data de nascimento (AAAA-MM-DD):" }),
    ),
    petOwner: petOwner!,
    schedules: [],
  };

  await animalService.registerAnimal(animal);
  console.log(`Animal ${animal.name} cadastrado com sucesso.`);
}

async function listPets(
  animalService: AnimalService,
  db: { animals: Animal[] },
): Promise<void> {
  if (db.animals.length === 0) {
    console.log("Nenhum animal cadastrado.");
    return;
  }

  for (const animal of db.animals) {
    const total = await animalService.getTotalSpent(animal);
    console.log(
      `${animal.name} | ${animal.species} | ${animal.breed} | responsável: ${animal.petOwner.name} | total: ${currency.format(total)}`,
    );
  }
}

function parseFutureDate(value: string): Date | string {
  const match = /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/.exec(
    value.trim(),
  );
  if (!match) {
    return "Informe a data no formato AAAA-MM-DD HH:mm.";
  }

  const [, year, month, day, hour, minute] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  );
  const isValidDate =
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day) &&
    date.getHours() === Number(hour) &&
    date.getMinutes() === Number(minute);

  if (!isValidDate || date <= new Date()) {
    return "Informe uma data e hora futuras válidas.";
  }
  return date;
}

async function scheduleConsultation(
  db: { animals: Animal[] },
  scheduleService: ScheduleService,
): Promise<void> {
  if (db.animals.length === 0) {
    console.log("Cadastre um animal antes de agendar um atendimento.");
    return;
  }

  const animal = await select<Animal>({
    message: "Selecione o animal:",
    choices: db.animals.map((item) => ({ name: item.name, value: item })),
  });
  const type = await select<ScheduleType>({
    message: "Tipo de atendimento:",
    choices: [
      { name: "Consulta de rotina", value: "consulta de rotina" },
      { name: "Consulta de urgência", value: "consulta de emergência" },
      { name: "Atendimento de emergência", value: "atendimento de emergência" },
    ],
  });
  const hasAdditionalProcedure = await confirm({
    message: "Adicionar procedimento adicional?",
    default: false,
  });
  const additionalValue = hasAdditionalProcedure
    ? Number(
        await input({
          message: "Valor do procedimento adicional:",
          validate: (value) => {
            const parsed = Number(value);
            return parsed > 0 || "Informe um valor maior que zero.";
          },
        }),
      )
    : undefined;
  const dateInput = await input({
    message: "Data e hora do atendimento (AAAA-MM-DD HH:mm):",
    validate: (value) => {
      const date = parseFutureDate(value);
      return date instanceof Date ? true : date;
    },
  });
  const scheduleDate = parseFutureDate(dateInput);

  if (!(scheduleDate instanceof Date)) {
    return;
  }

  const schedule: Schedule = await scheduleService.registerSchedule(
    animal,
    type,
    scheduleDate,
    additionalValue,
  );
  console.log(
    `Atendimento agendado. Valor: ${currency.format(schedule.value)}`,
  );
}

function listConsultations(db: {
  schedules: Array<{
    animal: Animal;
    type: ScheduleType;
    date: Date;
    value: number;
  }>;
}): void {
  if (db.schedules.length === 0) {
    console.log("Nenhum atendimento registrado.");
    return;
  }

  for (const schedule of db.schedules) {
    console.log(
      `${schedule.date.toLocaleString("pt-BR")} | ${schedule.animal.name} | ${schedule.type} | ${currency.format(schedule.value)}`,
    );
  }
}

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
