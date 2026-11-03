import restar from "./restador.js";
describe("Restador HU02", () => {
  it("resta positivos", () => expect(restar(8, 3)).toBe(5));
  it("resta negativos", () => expect(restar(-8, -3)).toBe(-5));
});
