/* @flow */

import path from 'path';

import FitbitApp from './app';
import JsonLoader from './json_loader';

const APP_FILE: string = path.join(__dirname, '../json/app.json');

export default class AppDataLoader {
  static async loadAppData(): Promise<FitbitApp> {
    const appDataJson: Object = await JsonLoader.loadJsonAtFilePath(APP_FILE);
    return FitbitApp.fromJson(appDataJson);
  }
}
