import multiplicar from "./multiplicador.js";
describe("Multiplicador HU02", () => {
  it("multiplica positivos", () => expect(multiplicar(4, 3)).toBe(12));
  it("multiplica por cero", () => expect(multiplicar(4, 0)).toBe(0));
});
