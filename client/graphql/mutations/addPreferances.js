import { gql } from "@apollo/client";

export const addPreferances = gql`
mutation SavePreferences($options: PreferencesOptions) {
  savePreferences(options: $options)
}`;
