import fs from "fs";
import path from "path";

const tournamentPath = path.resolve("./models/Tournament.ts");
console.log("Chemin :", tournamentPath);
console.log("Existe :", fs.existsSync(tournamentPath));

