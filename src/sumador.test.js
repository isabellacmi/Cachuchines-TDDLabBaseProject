import sumar from "./sumador.js";

describe("Sumar", () => {
  it("deberia sumar dos numeros", () => {
    expect(sumar(3, 2)).toEqual(5);
  });
});



describe("Sumador HU02 en main", () => {
  it("suma con cero", () => expect(sumar(0, 8)).toBe(8));
});

describe("Sumador HU02 signos y decimales", () => {
  it("suma negativos", () => expect(sumar(-3, -2)).toBe(-5));
  it("suma decimales", () => expect(sumar(0.1, 0.2)).toBeCloseTo(0.3));
});

it("suma signos diferentes", () => expect(sumar(-3, 8)).toBe(5));
