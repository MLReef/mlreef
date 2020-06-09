export default class BasicImplFunctions {
  parseMapsToJson = (map: Map<string, string>) => JSON.parse(JSON.stringify(map));
}