export async function copyArtifacts() {
  await copyArtifactsToFolder("./frontend/src/contracts/");
  await copyArtifactsToFolder("./reactCombineLandingPage/src/contracts");
}
async function copyArtifactsToFolder(folder) {
  const fs = require("fs");
  fs.copyFileSync(
    "./artifacts/contracts/PlayersFacet.sol/PlayersFacet.json",
    folder + "PlayersFacet.json"
  );
  fs.copyFileSync(
    "./artifacts/contracts/StakerFacet.sol/StakerFacet.json",
    folder + "StakerFacet.json"
  );
  fs.copyFileSync(
    "./artifacts/contracts/VaultFacet.sol/VaultFacet.json",
    folder + "VaultFacet.json"
  );
  fs.copyFileSync(
    "./artifacts/contracts/AdminFacet.sol/AdminFacet.json",
    folder + "AdminFacet.json"
  );
  fs.copyFileSync(
    "./artifacts/contracts/RouletteFacet.sol/RouletteFacet.json",
    folder + "RouletteFacet.json"
  );
  fs.copyFileSync(
    "./artifacts/contracts/diamond/facets/DiamondLoupeFacet.sol/DiamondLoupeFacet.json",
    folder + "DiamondLoupeFacet.json"
  );
}
