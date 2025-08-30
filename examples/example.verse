
// toy Verse dialect
let n: int = 5
let who: string = "Molecule"

Square(x:int): int = x * x
Greet(name:string): string = "Hello {name}, n is {n}"

print(Greet(who))
print(Square(n) + 7)
