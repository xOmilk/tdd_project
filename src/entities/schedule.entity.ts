import ScheduleType from "../types/schedule-type.type";
import Animal from "./animal.entity";
import PetOwner from "./pet-owner.entity";

interface Schedule {
  value: number;
  type: ScheduleType;
  date: Date;
  animal: Animal;
  petOwner: PetOwner;
}

export = Schedule;
