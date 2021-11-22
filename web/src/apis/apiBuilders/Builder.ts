export default interface Builder {
  method: string;
  headers: Map<string, string>;
  url: string;
  build(options: { pagination?: boolean }): Request;
}