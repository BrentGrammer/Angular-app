import { userInfo } from "os";

/**
 * This file manages the user model
 *   - managing auth tokens to see if they are valid or expired
 *
 * This class is used in auth service and stored as a Subject
 */

export class User {
  constructor(
    public email: string,
    public id: string,
    private _token: string,
    private _tokenExpirationDate: Date
  ) {}

  // use getter to prevent user dev from overwriting or setting the token on the user class instance
  get token() {
    // check if token is expired if it doesn't exist or if it is expired from current date:
    if (!this._tokenExpirationDate || new Date() > this._tokenExpirationDate) {
      return null;
    }
    return this._token;
  }
}

// as a closure:

// export function user(email: string, pw: string) {

//   const getToken = () => {
//     return
//   }
// }
