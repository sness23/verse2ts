// Auto-generated from examples/example.verse
let n: number = 5;
let who: string = "Molecule";
function Square(x: number): number { return x * x; }
function Greet(name: string): string { return `Hello ${name}, n is ${n}`; }
console.log(Greet(who));
console.log(Square(n) + 7);
