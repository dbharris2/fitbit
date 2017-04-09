/* @flow */

import * as fs from 'async-file';

export default class JsonLoader {
  static async loadJsonAtFilePath(filePathToJson: string): Promise<Object> {
    const json: Object = await fs.readFile(filePathToJson);
    return JSON.parse(String(json));
  }
}
