import sumar from "./sumador.js";

describe("Sumar", () => {
  it("deberia sumar dos numeros", () => {
    expect(sumar(3, 2)).toEqual(5);
  });
});



describe("Sumador HU02 en main", () => {
  it("suma con cero", () => expect(sumar(0, 8)).toBe(8));
});
