import * as fs from "node:fs/promises";

const FILE_NAME = "database.json";

class File {
  async init() {
    if (await this.fileExists()) {
      const content = await fs.readFile(FILE_NAME, "utf-8");
      return JSON.parse(content);
    }

    await fs.writeFile(FILE_NAME, JSON.stringify([]));

    return [];
  }

  private async fileExists() {
    try {
      await fs.access(FILE_NAME);
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = File;
