import Animal from "../src/entities/animal.entity";
import PetOwner from "../src/entities/pet-owner.entity";
import Schedule from "../src/entities/schedule.entity";
import { confirm, input, select } from "@inquirer/prompts";
import {
  listConsultations,
  listPets,
  parseFutureDate,
  registerPet,
  scheduleConsultation,
} from "../src/utils";
const MemoryDb = require("../src/db/memory.db");
const ScheduleService = require("../src/services/schedule.service");
const AnimalService = require("../src/services/animal.service");
const PetOwnerService = require("../src/services/pet-owner.service");

jest.mock("@inquirer/prompts", () => ({
  confirm: jest.fn(),
  input: jest.fn(),
  select: jest.fn(),
}));

function createAnimal(name = "Caramelo"): Animal {
  const petOwner: PetOwner = {
    name: "Teste",
    email: "example@example.com",
    phone: "75 99900-0000",
    animals: [],
    schedules: [],
  };
  return {
    name,
    species: "Cachorro",
    breed: "SRD",
    birthDate: new Date(),
    petOwner: petOwner,
    schedules: [],
  };
}

function createService() {
  const memoryDb = new MemoryDb();
  return {
    memoryDb,
    service: new ScheduleService(memoryDb),
    animalService: new AnimalService(memoryDb),
    petOwnerService: new PetOwnerService(memoryDb),
  };
}

function createPetOwner(): PetOwner {
  return {
    name: "Teste",
    email: "example@example.com",
    phone: "75 99900-0000",
    animals: [],
    schedules: [],
  };
}

function addPastSchedule(animal: Animal, value = 100): void {
  const schedule: Schedule = {
    value,
    type: "consulta de rotina",
    date: new Date(),
    animal,
    petOwner: animal.petOwner,
  };
  animal.schedules.push(schedule);
}

beforeEach(() => {
  jest.clearAllMocks();
});

test("A suíte principal está configurada", () => {
  expect(true).toBe(true);
});

test("Validar data futura no utilitário", () => {
  const result = parseFutureDate("2099-12-31 10:30");

  expect(result).toBeInstanceOf(Date);
  expect((result as Date).getFullYear()).toBe(2099);
});

test("Rejeitar data inválida ou passada no utilitário", () => {
  expect(parseFutureDate("data inválida")).toBe(
    "Informe a data no formato AAAA-MM-DD HH:mm.",
  );
  expect(parseFutureDate("2020-01-01 10:30")).toBe(
    "Informe uma data e hora futuras válidas.",
  );
});

test("Registrar pet pelo utilitário", async () => {
  const { memoryDb, animalService, petOwnerService } = createService();
  (input as jest.Mock)
    .mockResolvedValueOnce("novo@example.com")
    .mockResolvedValueOnce("Novo responsável")
    .mockResolvedValueOnce("75 99900-0000")
    .mockResolvedValueOnce("Rex")
    .mockResolvedValueOnce("Cachorro")
    .mockResolvedValueOnce("SRD")
    .mockResolvedValueOnce("2020-01-01");

  await registerPet(animalService, petOwnerService);

  expect(memoryDb.animals).toHaveLength(1);
  expect(memoryDb.animals[0].name).toBe("Rex");
  expect(memoryDb.animals[0].petOwner.email).toBe("novo@example.com");
});

test("Registrar outro pet para responsável existente", async () => {
  const petOwner = createPetOwner();
  const { memoryDb, animalService, petOwnerService } = createService();
  await petOwnerService.registerPetOwner(petOwner);
  (input as jest.Mock)
    .mockResolvedValueOnce(petOwner.email)
    .mockResolvedValueOnce("Luna")
    .mockResolvedValueOnce("Gato")
    .mockResolvedValueOnce("SRD")
    .mockResolvedValueOnce("2021-02-03");

  await registerPet(animalService, petOwnerService);

  expect(memoryDb.petOwners).toHaveLength(1);
  expect(petOwner.animals[0].name).toBe("Luna");
});

test("Listar pets cadastrados pelo utilitário", async () => {
  const animal = createAnimal();
  const { memoryDb, animalService } = createService();
  memoryDb.animals.push(animal);
  const consoleSpy = jest.spyOn(console, "log").mockImplementation();

  await listPets(animalService, memoryDb);

  expect(consoleSpy).toHaveBeenCalledWith(
    expect.stringContaining("Caramelo | Cachorro | SRD"),
  );
  consoleSpy.mockRestore();
});

test("Agendar consulta futura pelo utilitário", async () => {
  const animal = createAnimal();
  const { memoryDb, service } = createService();
  memoryDb.animals.push(animal);
  (select as jest.Mock)
    .mockResolvedValueOnce(animal)
    .mockResolvedValueOnce("consulta de rotina");
  (confirm as jest.Mock).mockResolvedValueOnce(false);
  (input as jest.Mock).mockResolvedValueOnce("2099-12-31 10:30");

  await scheduleConsultation(memoryDb, service);

  expect(memoryDb.schedules).toHaveLength(1);
  expect(memoryDb.schedules[0].date).toEqual(new Date(2099, 11, 31, 10, 30));
});

test("Agendar consulta com procedimento adicional", async () => {
  const animal = createAnimal();
  const { memoryDb, service } = createService();
  memoryDb.animals.push(animal);
  (select as jest.Mock)
    .mockResolvedValueOnce(animal)
    .mockResolvedValueOnce("consulta de rotina");
  (confirm as jest.Mock).mockResolvedValueOnce(true);
  (input as jest.Mock)
    .mockResolvedValueOnce("25.50")
    .mockResolvedValueOnce("2099-12-31 10:30");

  await scheduleConsultation(memoryDb, service);

  expect(memoryDb.schedules[0].value).toBe(125.5);
});

test("Não agendar consulta sem animais cadastrados", async () => {
  const consoleSpy = jest.spyOn(console, "log").mockImplementation();
  const { memoryDb, service } = createService();

  await scheduleConsultation(memoryDb, service);

  expect(consoleSpy).toHaveBeenCalledWith(
    "Cadastre um animal antes de agendar um atendimento.",
  );
  expect(select).not.toHaveBeenCalled();
  consoleSpy.mockRestore();
});

test("Rejeitar data de calendário inválida no utilitário", () => {
  expect(parseFutureDate("2099-02-30 10:30")).toBe(
    "Informe uma data e hora futuras válidas.",
  );
});

test("Listar pets sem animais pelo utilitário", async () => {
  const consoleSpy = jest.spyOn(console, "log").mockImplementation();
  const { animalService } = createService();

  await listPets(animalService, { animals: [] });

  expect(consoleSpy).toHaveBeenCalledWith("Nenhum animal cadastrado.");
  consoleSpy.mockRestore();
});

test("Listar consultas sem atendimentos pelo utilitário", () => {
  const consoleSpy = jest.spyOn(console, "log").mockImplementation();

  listConsultations({ schedules: [] });

  expect(consoleSpy).toHaveBeenCalledWith("Nenhum atendimento registrado.");
  consoleSpy.mockRestore();
});

test("Listar consultas registradas pelo utilitário", () => {
  const animal = createAnimal();
  const consoleSpy = jest.spyOn(console, "log").mockImplementation();

  listConsultations({
    schedules: [
      {
        animal,
        type: "consulta de rotina",
        date: new Date("2099-12-31T10:30:00"),
        value: 100,
      },
    ],
  });

  expect(consoleSpy).toHaveBeenCalledWith(
    expect.stringContaining("Caramelo | consulta de rotina"),
  );
  consoleSpy.mockRestore();
});

test("Registrar novo responsável", async () => {
  const petOwner = createPetOwner();
  const { memoryDb, petOwnerService } = createService();

  await petOwnerService.registerPetOwner(petOwner);

  expect(memoryDb.petOwners).toEqual([petOwner]);
});

test("Buscar responsável por e-mail", async () => {
  const petOwner = createPetOwner();
  const { petOwnerService } = createService();
  await petOwnerService.registerPetOwner(petOwner);

  await expect(
    petOwnerService.findPetOwnerByEmail(petOwner.email),
  ).resolves.toBe(petOwner);
  await expect(
    petOwnerService.findPetOwnerByEmail("inexistente@example.com"),
  ).resolves.toBeUndefined();
});

test("Consultar animais do responsável", async () => {
  const petOwner = createPetOwner();
  const animal = createAnimal();
  animal.petOwner = petOwner;
  petOwner.animals.push(animal);
  const { petOwnerService } = createService();

  await expect(petOwnerService.getAnimals(petOwner)).resolves.toEqual([animal]);
});

test("Calcular total gasto pelo responsável", async () => {
  const petOwner = createPetOwner();
  const animal = createAnimal();
  animal.petOwner = petOwner;
  petOwner.schedules.push(
    {
      value: 100,
      type: "consulta de rotina",
      date: new Date(),
      animal,
      petOwner,
    },
    {
      value: 180,
      type: "consulta de emergência",
      date: new Date(),
      animal,
      petOwner,
    },
  );
  const { petOwnerService } = createService();

  await expect(petOwnerService.getTotalSpent(petOwner)).resolves.toBe(280);
});

test("Calcular valor da consulta de rotina", async () => {
  const animal = createAnimal();
  const { service } = createService();
  expect(await service.calculatePrice(animal, "consulta de rotina")).toBe(100);
});

test("Calcular valor da consulta de urgência", async () => {
  const animal = createAnimal();
  const { service } = createService();
  expect(await service.calculatePrice(animal, "consulta de emergência")).toBe(
    180,
  );
});

test("Calcular valor do atendimento de emergência", async () => {
  const animal = createAnimal();
  const { service } = createService();
  expect(
    await service.calculatePrice(animal, "atendimento de emergência"),
  ).toBe(250);
});

test("Acumular valores de vários atendimentos", async () => {
  const animal = createAnimal();
  const { service, animalService } = createService();
  await animalService.registerAnimal(animal);
  await service.registerSchedule(animal, "consulta de rotina");
  await service.registerSchedule(animal, "consulta de emergência");
  expect(await animalService.getTotalSpent(animal)).toBe(280);
});

test("Consultar total gasto por animal existente", async () => {
  const animal = createAnimal();
  const { service, animalService } = createService();
  await animalService.registerAnimal(animal);
  await service.registerSchedule(animal, "atendimento de emergência");
  expect(await animalService.getTotalSpent(animal)).toBe(250);
});

test("Aplicar desconto de fidelidade", async () => {
  const animal = createAnimal();
  const { service } = createService();
  for (let index = 0; index < 5; index += 1) addPastSchedule(animal);
  expect(await service.countPastConsultations(animal)).toBe(5);
  expect(await service.calculatePrice(animal, "consulta de rotina")).toBe(90);
});

test("Não aplicar desconto sem fidelidade", async () => {
  const animal = createAnimal();
  const { service } = createService();
  for (let index = 0; index < 4; index += 1) addPastSchedule(animal);
  expect(await service.calculatePrice(animal, "consulta de rotina")).toBe(100);
});

test("Calcular atendimento com desconto", async () => {
  const animal = createAnimal();
  const { service } = createService();
  for (let index = 0; index < 5; index += 1) addPastSchedule(animal);
  expect(
    await service.calculatePrice(animal, "atendimento de emergência"),
  ).toBe(225);
});

test("Não permitir valor de serviço zero", async () => {
  const animal = createAnimal();
  const { service } = createService();
  await expect(
    service.calculatePrice(animal, "consulta de rotina", 0),
  ).rejects.toThrow();
});

test("Calcular valores decimais", async () => {
  const animal = createAnimal();
  const { service } = createService();
  expect(await service.calculatePrice(animal, "consulta de rotina", 25.5)).toBe(
    125.5,
  );
});

test("Não permitir valor final negativo", async () => {
  const animal = createAnimal();
  const { service } = createService();
  await expect(
    service.calculatePrice(animal, "consulta de rotina", -10),
  ).rejects.toThrow();
});

test("Animal inexistente lança exceção", async () => {
  const animal = createAnimal();
  const { animalService } = createService();
  await expect(animalService.getTotalSpent(animal)).rejects.toThrow(
    "Animal não encontrado",
  );
});

test("Registrar novo animal sem atendimentos", async () => {
  const animal = createAnimal();
  const { memoryDb, animalService } = createService();
  await animalService.registerAnimal(animal);
  expect(memoryDb.animals).toEqual([animal]);
  expect(await animalService.getTotalSpent(animal)).toBe(0);
});

test("Aplicar acréscimo de procedimento adicional", async () => {
  const animal = createAnimal();
  const { service } = createService();
  expect(await service.calculatePrice(animal, "consulta de rotina", 50)).toBe(
    150,
  );
});

test("Identificar retorno dentro do período", async () => {
  const animal = createAnimal();
  const { service, animalService } = createService();
  await animalService.registerAnimal(animal);
  const lastVisit = new Date("2026-09-01");
  await service.registerSchedule(animal, "consulta de rotina", lastVisit);
  const returnDate = new Date("2026-09-10");
  expect(await service.isReturnWithinPeriod(animal, returnDate)).toBe(true);
  expect(
    await service.isReturnWithinPeriod(animal, new Date("2026-10-10")),
  ).toBe(false);
});

test("Registrar vários animais em lista", async () => {
  const animals = [createAnimal("A"), createAnimal("B")];
  const { memoryDb, animalService } = createService();
  await Promise.all(
    animals.map((animal) => animalService.registerAnimal(animal)),
  );
  expect(memoryDb.animals).toHaveLength(2);
});

test("Calcular total gasto da lista de animais", async () => {
  const animals = [createAnimal("A"), createAnimal("B")];
  const { service, animalService } = createService();
  await Promise.all(
    animals.map((animal) => animalService.registerAnimal(animal)),
  );
  await service.registerSchedule(animals[0], "consulta de rotina");
  await service.registerSchedule(animals[1], "consulta de emergência");
  expect(await animalService.getTotalSpentForAnimals(animals)).toBe(280);
});

test("Filtrar animais com gasto acima de limite", async () => {
  const animals = [createAnimal("A"), createAnimal("B")];
  const { service, animalService } = createService();
  await Promise.all(
    animals.map((animal) => animalService.registerAnimal(animal)),
  );
  await service.registerSchedule(animals[0], "consulta de rotina");
  await service.registerSchedule(animals[1], "consulta de emergência");
  expect(await animalService.filterAnimalsBySpending(animals, 150)).toEqual([
    animals[1],
  ]);
});

test("Ordenar animais por total gasto", async () => {
  const animals = [createAnimal("A"), createAnimal("B")];
  const { service, animalService } = createService();
  await Promise.all(
    animals.map((animal) => animalService.registerAnimal(animal)),
  );
  await service.registerSchedule(animals[0], "consulta de rotina");
  await service.registerSchedule(animals[1], "atendimento de emergência");
  expect(await animalService.sortAnimalsBySpending(animals)).toEqual([
    animals[1],
    animals[0],
  ]);
});

test("Remover animais sem atendimentos", async () => {
  const animals = [createAnimal("A"), createAnimal("B")];
  const { service, animalService } = createService();
  await animalService.registerAnimal(animals[0]);
  await animalService.registerAnimal(animals[1]);
  await service.registerSchedule(animals[0], "consulta de rotina");
  expect(await animalService.removeAnimalsWithoutSchedules(animals)).toEqual([
    animals[0],
  ]);
});

test("Buscar animal por nome", async () => {
  const animals = [createAnimal("A"), createAnimal("B")];
  const { animalService } = createService();
  expect(await animalService.findAnimalByName(animals, "B")).toBe(animals[1]);
});

test("Somar faturamento total da lista", async () => {
  const animals = [createAnimal("A"), createAnimal("B")];
  const { service, animalService } = createService();
  await Promise.all(
    animals.map((animal) => animalService.registerAnimal(animal)),
  );
  await service.registerSchedule(animals[0], "consulta de rotina");
  await service.registerSchedule(animals[1], "atendimento de emergência");
  expect(await animalService.getTotalSpentForAnimals(animals)).toBe(350);
});

test("Gerar ranking de animais por total gasto", async () => {
  const animals = [createAnimal("A"), createAnimal("B")];
  const { service, animalService } = createService();
  await Promise.all(
    animals.map((animal) => animalService.registerAnimal(animal)),
  );
  await service.registerSchedule(animals[0], "consulta de emergência");
  await service.registerSchedule(animals[1], "atendimento de emergência");
  expect(await animalService.rankingBySpending(animals)).toEqual([
    animals[1],
    animals[0],
  ]);
});
