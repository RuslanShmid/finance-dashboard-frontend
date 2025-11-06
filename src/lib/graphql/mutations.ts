import { gql } from '@apollo/client';

export const SIGN_IN_MUTATION = gql`
  mutation SignIn($input: SignInInput!) {
    signIn(input: $input) {
      user {
        id
        email
        firstName
        lastName
      }
      token
      errors
    }
  }
`;

export const SIGN_UP_MUTATION = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      user {
        id
        email
        firstName
        lastName
      }
      token
      errors
    }
  }
`;

export const SIGN_OUT_MUTATION = gql`
  mutation SignOut {
    signOut {
      message
    }
  }
`;

