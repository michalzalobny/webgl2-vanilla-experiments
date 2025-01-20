const powN = (n: number) => {
  return function (t: number) {
    let result = 1;
    for (let i = 0; i < n; i++) {
      result *= t;
    }
    return result;
  };
};

interface PolynomialEase {
  degree: number;
}

const polynomialEase = ({ degree }: PolynomialEase) => {
  const powFunc = powN(degree);
  return function (t: number) {
    t = t * 2;
    if (t < 1) {
      return 0.5 * powFunc(t);
    }
    return 0.5 * (2 - powFunc(2 - t));
  };
};

export const polynomialEase2 = polynomialEase({ degree: 2.0 });
export const polynomialEase4 = polynomialEase({ degree: 4.4 });
