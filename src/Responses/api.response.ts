export class ApiResponse {
  constructor(
    public readonly status: number,
    public readonly content: string,
    public readonly data: any,
  ) {}

  json() {
    return {
      status: this.status,
      content: this.content,
      data: this.data,
    };
  }
}
