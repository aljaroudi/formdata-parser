type ReturnTypes = {
	file: File | Error
	fileOptional: File | null | Error

	text: string | Error
	textOptional: string | null | Error

	nonempty: string | Error
	nonemptyOptional: string | null | Error

	number: number | Error
	numberOptional: number | null | Error

	date: Date | Error
	dateOptional: Date | null | Error

	checkbox: boolean | Error
}

type SchemaType = keyof ReturnTypes

export function parseField<T extends SchemaType>(
	type: T,
	data: FormDataEntryValue | null
): ReturnTypes[T] | Error {
	if (data === null)
		return type.endsWith('Optional')
			? (null as ReturnTypes[T])
			: type === 'checkbox'
			? (false as ReturnTypes[T])
			: new Error(`Required value is missing for ${type}`)

	if (data instanceof File)
		return type.startsWith('file')
			? (data as ReturnTypes[T])
			: new Error(`Expected ${type}. Got file`)

	switch (type) {
		case 'file':
		case 'fileOptional':
			return new Error(`Expected ${type}. Got ${typeof data}: ${data}`)

		case 'text':
		case 'textOptional':
			return data as ReturnTypes[T]

		case 'nonempty':
		case 'nonemptyOptional':
			return data.length > 0
				? (data as ReturnTypes[T])
				: new Error('Expected nonempty string. Got empty string')

		case 'number':
		case 'numberOptional': {
			const value = Number(data)
			return isNaN(value)
				? new Error(`Value is not a number: ${data}`)
				: (value as ReturnTypes[T])
		}

		case 'date':
		case 'dateOptional': {
			const date = new Date(data)
			return !isNaN(date.getTime())
				? (date as ReturnTypes[T])
				: new Error(`Value is not a date: ${data}`)
		}

		case 'checkbox':
			return data === 'yes'
				? (true as ReturnTypes[T])
				: new Error(`Expected checkbox. Got ${data}`)

		default:
			throw new Error(`Unknown type: ${type}`)
	}
}

type Schema = Record<string, SchemaType>
export function parse<T extends Schema>(data: FormData, schema: T) {
	const parsedData: Partial<{ [K in keyof T]: unknown }> = {}

	for (const [key, type] of Object.entries(schema)) {
		const parsedValue = parseField(type, data.get(key))

		if (parsedValue instanceof Error) return parsedValue

		parsedData[key as keyof T] = parsedValue as ReturnTypes[T[keyof T]]
	}

	return parsedData as { [K in keyof T]: Exclude<ReturnTypes[T[K]], Error> }
}

export function parseOrNull<T extends Schema>(data: FormData, schema: T) {
	const parsed = parse(data, schema)
	return parsed instanceof Error ? null : parsed
}
