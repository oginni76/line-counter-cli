#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import ignore from 'ignore';

const customExclusions = [
  'tsconfig.json',
  'package.json',
  'package-lock.json',
];

/** Recursively traverse directory and return list of all file paths
 * excluding files and directories in gitignore,custom exclusions and hidden folders
 * @param dirpath - directory path to traverse
 * @param ignoreDirs - directories to ignore during traversal
 * @returns a list of file paths
 */


const traverseDirectory = (dirPath: string, ignoreDirs: string[] = ['node_modules',]): string[] => {
  const files: string[] = [];
  const ig = ignore();

  const gitignorePath = path.join(dirPath, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const ignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    ig.add(ignoreContent);
  }

  const traverse = (currentPath: string) => {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const relativePath = path.relative(dirPath, fullPath);
      const stats = fs.statSync(fullPath);

      if (
        customExclusions.includes(item) ||
        item.startsWith('.') ||
        ig.ignores(relativePath) ||
        ignoreDirs.includes(item)
      ) {
        continue;
      }

      if (stats.isDirectory()) {
        traverse(fullPath);
      } else if (stats.isFile()) {
        files.push(fullPath);
      }
    }
  }

  traverse(dirPath);
  return files;
}

/**
 * Analyzes the content of each file, categorizing lines into code, comment, and empty lines.
 * @param files - An array of file paths.
 * @returns Project and detailed file statistics.
 */

function analyzeLinesInFiles(files: string[]): void {
    let totalFiles = files.length;
    let totalLines = 0;
    let totalCodeLines = 0;
    let totalCommentLines = 0;
    let totalEmptyLines = 0;
    
    // If the current program doesnt support comments for the language you use
    // add it here

    const singleLineCommentPatterns = [/^\/\//, /^#/, /^;/, /^--/, /^%/]; 
    const blockCommentStartPatterns = [/^\/\*/, /^<!--/, /^"""/];
    const blockCommentEndPatterns = [/\*\/$/, /-->$/, /"""$/];
  
    const fileStats = files.map((file) => {
      let fileLines = 0;
      let codeLines = 0;
      let commentLines = 0;
      let emptyLines = 0;
      let inBlockComment = false;  // Tracks multi-line comment status
  
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
  
        lines.forEach(line => {
          fileLines++;
          const trimmedLine = line.trim();
  
          if (trimmedLine === '') {
            emptyLines++;
          } else if (inBlockComment) {
            commentLines++;
            if (blockCommentEndPatterns.some(pattern => pattern.test(trimmedLine))) {
              inBlockComment = false;  // End of multi-line comment
            }
          } else if (singleLineCommentPatterns.some(pattern => pattern.test(trimmedLine))) {
            commentLines++;
          } else if (blockCommentStartPatterns.some(pattern => pattern.test(trimmedLine))) {
            commentLines++;
            if (!blockCommentEndPatterns.some(pattern => pattern.test(trimmedLine))) {
              inBlockComment = true;  // Start of multi-line comment
            }
          } else {
            codeLines++;
          }
        });
  
        totalLines += fileLines;
        totalCodeLines += codeLines;
        totalCommentLines += commentLines;
        totalEmptyLines += emptyLines;
  
        return {
          file,
          totalLines: fileLines,
          codeLines,
          commentLines,
          emptyLines,
        };
  
      } catch (error) {
        console.error(`Error reading file ${file}:`, error);
        return null;
      }
    }).filter(stat => stat !== null);
  
    // Displaying Project Statistics
    console.log("\nProject Statistics:");
    console.log("===================");
    console.log(`Total Files: ${totalFiles}`);
    console.log(`Total Lines: ${totalLines}`);
    console.log(`Code Lines: ${totalCodeLines}`);
    console.log(`Comment Lines: ${totalCommentLines}`);
    console.log(`Empty Lines: ${totalEmptyLines}`);
  
    // Displaying Detailed File Statistics
    console.log("\nDetailed File Statistics:");
    console.log("==========================");
    fileStats.forEach(stat => {
      if (stat) {
        // console.log(`\nFile: ${stat.file}`); This shows the whole filepath if you want to see it
        console.log(`\nFile: ${path.relative(process.cwd(), stat.file)}`);
        console.log(`  Total Lines: ${stat.totalLines}`);
        console.log(`  Code Lines: ${stat.codeLines}`);
        console.log(`  Comment Lines: ${stat.commentLines}`);
        console.log(`  Empty Lines: ${stat.emptyLines}`);
      }
    });
  }

  
//Test the function with our traversal and analysis
const projectFiles = traverseDirectory(process.cwd());
analyzeLinesInFiles(projectFiles);

module.exports = {
    traverseDirectory,
    analyzeLinesInFiles
}