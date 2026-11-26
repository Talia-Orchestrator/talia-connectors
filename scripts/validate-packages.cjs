#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const here=path.resolve(__dirname,'..');
const {loadPacker}=require('./resolve-packer.cjs');
const packer=loadPacker(here);
const packageDirs=(repoPath)=>{
 const packageRoot=path.join(repoPath,'packages');
 return fs.readdirSync(packageRoot).sort().filter(name=>fs.statSync(path.join(packageRoot,name)).isDirectory()).map(name=>path.join(packageRoot,name));
};
const packages=packageDirs(here);

if(!packages.length) throw new Error('No package directories found.');
const built=packer.buildCatalogV3(packages);
console.log('Valid package catalog:',JSON.parse(built.catalogBytes.toString('utf8')).packages.length,'packages;',built.artifacts.length,'artifacts.');
