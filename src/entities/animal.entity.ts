import PetOwner from "./pet-owner.entity";
import Schedule from "./schedule.entity";

interface Animal {
  name: string;
  species: string;
  breed: string;
  birthDate: Date;
  petOwner: PetOwner;
  schedules: Schedule[];
}

export = Animal;
