# formdata-schema

Parse your `FormData` with a simple schema.

## Installation

```sh
pnpm i formdata-schema
```

## Usage

```ts
import { parse } from 'formdata-schema'

// data: FormData
const parsed = parse(data, {
	first_name: 'nonempty',
	last_name: 'nonempty',
	height: 'number',
	birthdate: 'date',
	avatar: 'fileOptional',
	note: 'text',
})
```

Type of `parsed`:

```ts
Error | {
    first_name: string // length > 0
    last_name: string // length > 0
    height: number
    birthdate: Date
    avatar: File | null
    note: string
}
```
