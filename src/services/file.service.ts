import * as fs from "node:fs/promises";

class FileService {
  static FILE_NAME = "database.json";

  static async init() {
    if (await this.fileExists()) {
      const content = await fs.readFile(this.FILE_NAME, "utf-8");
      return JSON.parse(content);
    }

    await fs.writeFile(this.FILE_NAME, JSON.stringify([]));

    return [];
  }

  static async delete() {
    try {
      await fs.unlink(this.FILE_NAME);
    } catch (error) {
      throw new Error("Erro ao deletar arquivo");
    }
  }

  private static async fileExists() {
    try {
      await fs.access(this.FILE_NAME);
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = FileService;
