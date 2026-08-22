import Animal from "../../src/entities/animal.entity";
import ScheduleType from "../../src/types/schedule-type.type";

const ScheduleService = require("../../src/services/schedule.service");

test("Calcular valor da consulta de rotina", async () => {
  const animal: Animal = {
    name: "Caramelo",
    species: "Cachorro",
    breed: "SRD",
    birthDate: new Date(),
  };
  const type: ScheduleType = "consulta de rotina";
  const result = await ScheduleService.calculatePrice(animal, type);
  expect(result).toBeInstanceOf(Number);
  expect(result).toBe(100);
});

test("Calcular valor da consulta de emergência", async () => {
  const animal: Animal = {
    name: "Caramelo",
    species: "Cachorro",
    breed: "SRD",
    birthDate: new Date(),
  };
  const type: ScheduleType = "consulta de emergência";
  const result = await ScheduleService.calculatePrice(animal, type);
  expect(result).toBeInstanceOf(Number);
  expect(result).toBe(100);
});

test("Calcular valor da atendimento de emergência", async () => {
  const animal: Animal = {
    name: "Caramelo",
    species: "Cachorro",
    breed: "SRD",
    birthDate: new Date(),
  };
  const type: ScheduleType = "atendimento de emergência";
  const result = await ScheduleService.calculatePrice(animal, type);
  expect(result).toBeInstanceOf(Number);
  expect(result).toBe(100);
});
