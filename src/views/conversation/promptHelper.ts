import * as toml from 'toml'

export function extractVariables(text: string): string[] {
  // Regular expression to match the pattern ${variable_name}
  const variableRegex = /\$\{([A-Za-z0-9_-]+)\}/g
  const variables: string[] = []

  let match: RegExpExecArray | null
  // Using regex.exec to iteratively find all matches in the text
  while ((match = variableRegex.exec(text)) !== null) {
    // Push the variable name (first capture group) into the variables array
    variables.push(match[1])
  }

  return variables
}

export function replaceVariablesWithValues(
  text: string,
  values: { [key: string]: string }
): string {
  return text.replace(/\$\{([A-Za-z0-9_-]+)\}/g, (match, variableName) => {
    // Check if the variable name has a corresponding value in the values object
    if (Object.prototype.hasOwnProperty.call(values, variableName)) {
      // Replace the variable with its value from the values object
      return values[variableName]
    }
    // If the variable name is not found in the values object, don't replace it
    return match
  })
}

export function parseInput(input: string) {
  return toml.parse(input)
}
