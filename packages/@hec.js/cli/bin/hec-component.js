#!/usr/bin/env node

import { createComponent } from "../lib/index.js"
import args from 'args';

await createComponent('component', args.parse(process.argv), process.argv.at(-1))