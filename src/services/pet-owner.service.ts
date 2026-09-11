import Animal from "../entities/animal.entity";
import PetOwner from "../entities/pet-owner.entity";

export default class PetOwnerService {
  private readonly _db: typeof MemoryDb;

  constructor(db: typeof MemoryDb) {
    this._db = db;
  }

  async registerPetOwner(petOwner: PetOwner): Promise<PetOwner> {
    if (!this._db.petOwners.includes(petOwner)) {
      this._db.petOwners.push(petOwner);
    }
    return petOwner;
  }

  async findPetOwnerByEmail(email: string): Promise<PetOwner | undefined> {
    return this._db.petOwners.find(
      (petOwner: PetOwner) => petOwner.email === email,
    );
  }

  async getAnimals(petOwner: PetOwner): Promise<Animal[]> {
    return petOwner.animals;
  }

  async getTotalSpent(petOwner: PetOwner): Promise<number> {
    return petOwner.schedules.reduce(
      (total, schedule) => total + schedule.value,
      0,
    );
  }
}

if (typeof module !== "undefined") {
  module.exports = PetOwnerService;
}
