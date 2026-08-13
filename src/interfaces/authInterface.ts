import { UserTypeEnum } from "../enums/userTypesEnum"
import { PriceRangeEnum } from "../enums/priceRangeEnum"
import { UserInterface } from "./userInterface"
import { PlaceInterface } from "./placeInterface"

export interface InputAuthSignUpInterface {
    email: string,
    password: string,
    name: string,
    userType: UserTypeEnum,
}

// Flat, not nested under a `place` key - matches docs/03-architecture.md's
// signUpBusiness section: InputAuthSignUp's fields (minus userType, implied
// BUSINESS) plus the same place fields createPlace's InputPlace already takes.
export interface InputSignUpBusinessInterface {
    name: string,
    email: string,
    password: string,
    label: string,
    description?: string,
    address: string,
    phone: string,
    website?: string,
    categoryId: number,
    priceRange?: PriceRangeEnum,
}

export interface SignUpBusinessResponseInterface {
    user: UserInterface,
    place: PlaceInterface,
    token: {
        access: string;
        refresh: string;
    };
}

export interface InputAuthLoginInterface {
    email: string,
    password: string
}

export interface AuthResponseInterface {
    user: UserInterface,
    token: {
        access: string;
        refresh: string;
      };
}

export interface AuthTokenPayload {
    id: string;
    userType: UserTypeEnum;
}