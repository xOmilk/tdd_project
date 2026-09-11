import Animal from "../entities/animal.entity";
import Schedule from "../entities/schedule.entity";

export default class AnimalService {
  private readonly _db: typeof MemoryDb;

  constructor(db: typeof MemoryDb) {
    this._db = db;
  }

  async registerAnimal(animal: Animal): Promise<Animal> {
    if (!this._db.animals.includes(animal)) {
      this._db.animals.push(animal);
    }
    if (!animal.petOwner.animals.includes(animal)) {
      animal.petOwner.animals.push(animal);
    }
    return animal;
  }

  async getTotalSpent(animal: Animal): Promise<number> {
    this.ensureAnimalExists(animal);
    return this.schedulesFor(animal).reduce(
      (total, schedule) => total + schedule.value,
      0,
    );
  }

  async getTotalSpentForAnimals(animals: Animal[]): Promise<number> {
    const totals = await Promise.all(
      animals.map((animal) => this.getTotalSpent(animal)),
    );
    return totals.reduce((total, value) => total + value, 0);
  }

  async filterAnimalsBySpending(
    animals: Animal[],
    limit: number,
  ): Promise<Animal[]> {
    const result: Animal[] = [];
    for (const animal of animals) {
      if ((await this.getTotalSpent(animal)) > limit) {
        result.push(animal);
      }
    }
    return result;
  }

  async sortAnimalsBySpending(animals: Animal[]): Promise<Animal[]> {
    const totals = await Promise.all(
      animals.map(async (animal) => ({
        animal,
        total: await this.getTotalSpent(animal),
      })),
    );
    return totals
      .sort((left, right) => right.total - left.total)
      .map(({ animal }) => animal);
  }

  async removeAnimalsWithoutSchedules(animals: Animal[]): Promise<Animal[]> {
    return animals.filter((animal) => this.schedulesFor(animal).length > 0);
  }

  async findAnimalByName(
    animals: Animal[],
    name: string,
  ): Promise<Animal | undefined> {
    return animals.find((animal) => animal.name === name);
  }

  async rankingBySpending(animals: Animal[]): Promise<Animal[]> {
    return this.sortAnimalsBySpending(animals);
  }

  private schedulesFor(animal: Animal): Schedule[] {
    const schedules = this._db.schedules.filter(
      (schedule: Schedule) => schedule.animal === animal,
    );
    return schedules.length > 0 ? schedules : animal.schedules;
  }

  private ensureAnimalExists(animal: Animal): void {
    if (!this._db.animals.includes(animal)) {
      throw new Error("Animal não encontrado");
    }
  }
}

if (typeof module !== "undefined") {
  module.exports = AnimalService;
}
