# @goldenhippo/builder-types

Shared Builder.io type definitions used by all Golden Hippo schema packages.

## Table of Contents

- [Installation](#installation)
- [Types](#types)
  - [ModelShape](#modelshape)
  - [BuilderResponseBaseData](#builderresponsebasedata)
  - [BuilderIOFieldTypes](#builderiofieldtypes)
- [Usage](#usage)
- [Development](#development)

## Installation

```bash
npm install @goldenhippo/builder-types
```

## Types

### ModelShape

Defines the structure of a Builder.io content model for registration via the API:

```typescript
interface ModelShape {
  name: string; // Unique model identifier
  displayName: string; // UI display name
  kind: 'data' | 'component' | 'page';
  helperText?: string;
  contentTitleField?: string; // Which field displays as the title
  fields: BuilderIOFieldTypes[];
  editingUrlLogic?: string; // Custom URL logic (JavaScript)
  hideFromUI?: boolean;
}
```

### BuilderResponseBaseData

Base interface for all content type `data` properties. Extends Builder.io's content structure:

```typescript
interface BuilderResponseBaseData {
  blocks?: BuilderElement[];
  inputs?: Input[];
  state?: Record<string, any>;
  [key: string]: any;
}
```

### BuilderIOFieldTypes

Union type covering all Builder.io field configurations:

- **Text fields** — `text`, `longText`, `html`, `boolean`, `color`, `url`, `timestamp`
- **File fields** — with `allowedFileTypes` and `showTemplatePicker`
- **Reference fields** — link to other models via `modelId`
- **List fields** — arrays with `subFields`
- **Object fields** — nested objects with `subFields`
- **Number fields** — numeric values
- **Select fields** — dropdown with `enum` values
- **Tags fields** — tag input
- **UIBlocks fields** — Builder.io visual blocks

## Usage

```typescript
import type { ModelShape, BuilderIOFieldTypes, BuilderResponseBaseData } from '@goldenhippo/builder-types';

// Define a custom model
const model: ModelShape = {
  name: 'my-model',
  displayName: 'My Model',
  kind: 'data',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'image', type: 'file', allowedFileTypes: ['jpeg', 'png'] },
  ],
};

// Extend base data for custom content types
type MyContentData = BuilderResponseBaseData & {
  title: string;
  image?: string;
};
```

## Development

```bash
npm run build        # Build with tsup (CJS + ESM + declarations)
npm run dev          # Watch mode
npm run typecheck    # Type-check with tsc
npm run lint         # Lint with eslint
```
