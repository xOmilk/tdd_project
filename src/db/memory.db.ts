import Animal from "../entities/animal.entity";
import PetOwner from "../entities/pet-owner.entity";
import Schedule from "../entities/schedule.entity";

export default class MemoryDb {
  animals: Animal[] = [];
  petOwners: PetOwner[] = [];
  schedules: Schedule[] = [];
}

if (typeof module !== "undefined") {
  module.exports = MemoryDb;
}
