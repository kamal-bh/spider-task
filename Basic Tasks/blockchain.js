const PRIME = 7919; // A small prime number for modulo operations

// Evaluate the polynomial at x
function evalPolynomial(coeffs, x) {
  let result = 0; // Start with 0, to store the final value

  for (let i = 0; i < coeffs.length; i++) {
    const coeff = coeffs[i]; // Get the coefficient at position i
    const power = Math.pow(x, i); // Calculate x raised to the power i
    const term = coeff * power; // Multiply coefficient with x^i
    result = (result + term) % PRIME; // Add the term and take modulo PRIME
  }

  return result; // Return the final evaluated value
}

// Generate n shares with threshold k
function generateShares(secret, n, k) {
  const coeffs = [secret];
  for (let i = 1; i < k; i++) {
    coeffs.push(Math.floor(Math.random() * PRIME));
  }

  const shares = [];
  for (let i = 1; i <= n; i++) {
    shares.push([i, evalPolynomial(coeffs, i)]);
  }

  return shares;
}

// Modular inverse using Extended Euclidean Algorithm
function modInverse(a, prime) {
  let [m0, x0, x1] = [prime, 0, 1];
  while (a > 1) {
    let q = Math.floor(a / prime);
    [a, prime] = [prime, a % prime];
    [x0, x1] = [x1 - q * x0, x0];
  }
  return x1 < 0 ? x1 + m0 : x1;
}

// Reconstruct the secret using Lagrange Interpolation at x=0
function reconstructSecret(shares) {
  let secret = 0;

  for (let i = 0; i < shares.length; i++) {
    let [xi, yi] = shares[i];
    let num = 1, den = 1;

    for (let j = 0; j < shares.length; j++) {
      if (i !== j) {
        let [xj] = shares[j];
        num = (num * -xj) % PRIME;
        den = (den * (xi - xj)) % PRIME;
      }
    }

    const inv = modInverse(den, PRIME);
    const term = (yi * num * inv) % PRIME;
    secret = (secret + term + PRIME) % PRIME;
  }

  return secret;
}

// ----- Demo -----
const secret = 1234;
const totalShares = 5;
const threshold = 3;

const shares = generateShares(secret, totalShares, threshold);
console.log("Generated Shares:", shares);

const selected = shares.slice(0, threshold);
const recovered = reconstructSecret(selected);
console.log("Recovered Secret:", recovered);
