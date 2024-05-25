export class ArrayHelper {
  public static get(data: any, key: string, defaultData: any = null): any {
    try {
      const keys = key.split('.');
      // let result = [];
      // console.log(keys);
      return null;
    } catch (e) {
      return defaultData;
    }
  }
}
