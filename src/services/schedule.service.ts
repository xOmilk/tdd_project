import Animal from "../entities/animal.entity";
import Schedule from "../entities/schedule.entity";
import ScheduleType from "../types/schedule-type.type";

export default class ScheduleService {
  private readonly _db: typeof MemoryDb;

  constructor(db: typeof MemoryDb) {
    this._db = db;
  }

  async calculatePrice(
    animal: Animal,
    type: ScheduleType,
    additionalValue?: number,
  ): Promise<number> {
    if (additionalValue !== undefined && additionalValue <= 0) {
      throw new Error("O valor adicional deve ser maior que zero");
    }

    const values: Record<ScheduleType, number> = {
      "consulta de rotina": 100,
      "consulta de emergência": 180,
      "atendimento de emergência": 250,
    };
    const serviceValue = values[type];

    if (serviceValue === undefined) {
      throw new Error("Tipo de atendimento inválido");
    }

    const total = serviceValue + (additionalValue ?? 0);
    const discount = (await this.countPastConsultations(animal)) >= 5 ? 0.9 : 1;

    return Number((total * discount).toFixed(2));
  }

  async countPastConsultations(animal: Animal): Promise<number> {
    return this.schedulesFor(animal).length;
  }

  async registerSchedule(
    animal: Animal,
    type: ScheduleType,
    date = new Date(),
    additionalValue?: number,
  ): Promise<Schedule> {
    const schedule: Schedule = {
      value: await this.calculatePrice(animal, type, additionalValue),
      type,
      date,
      animal,
      petOwner: animal.petOwner,
    };

    animal.schedules.push(schedule);
    animal.petOwner.schedules.push(schedule);
    this._db.schedules.push(schedule);
    return schedule;
  }

  async isReturnWithinPeriod(
    animal: Animal,
    date: Date,
    periodInDays = 30,
  ): Promise<boolean> {
    const schedules = this.schedulesFor(animal);
    if (schedules.length === 0) {
      return false;
    }

    const lastSchedule = schedules.reduce((latest, schedule) =>
      schedule.date > latest.date ? schedule : latest,
    );
    const elapsed = date.getTime() - lastSchedule.date.getTime();
    return elapsed >= 0 && elapsed <= periodInDays * 24 * 60 * 60 * 1000;
  }

  private schedulesFor(animal: Animal): Schedule[] {
    const schedules = this._db.schedules.filter(
      (schedule: Schedule) => schedule.animal === animal,
    );
    return schedules.length > 0 ? schedules : animal.schedules;
  }
}

if (typeof module !== "undefined") {
  module.exports = ScheduleService;
}
