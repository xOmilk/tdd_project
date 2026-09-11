import Animal from "./animal.entity";
import Schedule from "./schedule.entity";

interface PetOwner {
  name: string;
  email: string;
  phone: string;
  animals: Animal[];
  schedules: Schedule[];
}

export = PetOwner;
