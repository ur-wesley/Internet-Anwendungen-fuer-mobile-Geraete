#!/usr/bin/env bun

import { $ } from "bun";
import { readFileSync, existsSync } from "node:fs";

/**
 * Creates a zip file of the project while respecting .zipignore
 */
async function createZip() {
 const projectName = "mwf";
 const zipName = `${projectName}.zip`;

 console.log(`📦 Creating ${zipName}...`);

 const zipignorePath = ".zipignore";
 const excludePatterns: string[] = [".git", zipName];

 if (existsSync(zipignorePath)) {
  const zipignoreContent = readFileSync(zipignorePath, "utf-8");
  const patterns = zipignoreContent
   .split("\n")
   .map((line) => line.trim())
   .filter((line) => line && !line.startsWith("#"));

  excludePatterns.push(...patterns);
  console.log(
   `📋 Found .zipignore with ${patterns.length} additional patterns`
  );
 }
 try {
  if (existsSync(zipName)) {
   await $`powershell -Command "Remove-Item '${zipName}' -Force"`;
   console.log(`🗑️  Removed existing ${zipName}`);
  }

  console.log("📁 Creating zip archive...");

  const excludeFilter = excludePatterns
   .map((pattern) => {
    if (pattern.includes("*")) {
     return `$_.Name -notlike '${pattern}'`;
    }

    return `$_.Name -ne '${pattern}' -and $_.FullName -notlike '*\\${pattern}\\*' -and $_.FullName -notlike '*\\${pattern}'`;
   })
   .join(" -and ");

  console.log(`🔍 Excluding patterns: ${excludePatterns.join(", ")}`);
  const powershellScript = `
    $allItems = Get-ChildItem -Path '.' -Recurse | Where-Object { ${excludeFilter} }
    
    $filesToZip = $allItems | Where-Object { -not $_.PSIsContainer } | ForEach-Object {
      $_.FullName.Substring((Get-Location).Path.Length + 1)
    }
    
    if ($filesToZip.Count -gt 0) {
      Write-Host "📄 Including $($filesToZip.Count) files in zip"
      
      Add-Type -AssemblyName System.IO.Compression.FileSystem
      
      if (Test-Path '${zipName}') { Remove-Item '${zipName}' -Force }
      
      $zip = [System.IO.Compression.ZipFile]::Open('${zipName}', 'Create')
      
      foreach ($file in $filesToZip) {
        $fullPath = Join-Path (Get-Location) $file
        $entryName = $file -replace '\\\\', '/'
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $fullPath, $entryName, 'Optimal') | Out-Null
      }
      
      $zip.Dispose()
    } else {
      Write-Error "No files to zip after applying exclusions"
      exit 1
    }
  `;

  await $`powershell -Command ${powershellScript}`;

  if (existsSync(zipName)) {
   console.log(`✅ Successfully created ${zipName}`);

   const stats =
    await $`powershell -Command "(Get-Item '${zipName}').Length"`.quiet();
   const sizeKB = Math.round(Number.parseInt(stats.text().trim(), 10) / 1024);
   console.log(`📊 Zip size: ${sizeKB} KB`);
  } else {
   throw new Error("Zip file was not created");
  }
 } catch (error) {
  console.error("❌ Error creating zip:", error);
  process.exit(1);
 }
}

if (import.meta.main) {
 await createZip();
}

export { createZip };
