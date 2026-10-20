import { FieldError, Text } from 'react-aria-components'

/** Shared descriptions and native validation messages for composite fields. */
export function FieldFeedback({ hint, error }: { hint?: string; error?: string }) {
  return (
    <>
      {(hint || error) && (
        <Text
          slot="description"
          className={`bbb-field__message ${error ? 'bbb-field__message--error' : ''}`}
        >
          {error || hint}
        </Text>
      )}
      {!error && <FieldError className="bbb-field__message bbb-field__message--error" />}
    </>
  )
}
