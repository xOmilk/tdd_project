import Animal from "../entities/animal.entity";
import ScheduleType from "../types/schedule-type.type";

class ScheduleService {
  static async calculatePrice(
    animal: Animal,
    type: ScheduleType,
  ): Promise<number> {
    throw new Error("Not implemented");
  }

  static async countPastConsultations(animal: Animal) {
    throw new Error("Not implemented");
  }
}

module.exports = ScheduleService;
