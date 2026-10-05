export type Credentials = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
};

export type Session = {
  user: AuthUser;
  accessToken: string;
};
