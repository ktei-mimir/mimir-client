import { expect, test } from 'vitest'
import {
  extractVariables,
  parseInput,
  replaceVariablesWithValues
} from '@/views/conversation/promptHelper'

test('extractVariables', () => {
  const text = 'Hello ${name}, {}, {, ${another_variable-2} how are you?'
  const variables = extractVariables(text)
  expect(variables).toEqual(['name', 'another_variable-2'])
})

test('replaceVariablesWithValues', () => {
  const text = 'Hello ${name}, how are you?'
  const values = { name: 'John' }
  const replacedText = replaceVariablesWithValues(text, values)
  expect(replacedText).toEqual('Hello John, how are you?')
})

test('parseInput', () => {
  const input = `
    name = 'John'
    age = 23
    free_text = """
This is some
free
text!"""
  `
  const parsedInput = parseInput(input)
  expect(parsedInput).toEqual({
    name: 'John',
    age: 23,
    free_text: 'This is some\nfree\ntext!'
  })
})
