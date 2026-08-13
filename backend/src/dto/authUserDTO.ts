import { UserTypeEnum } from "../enums/userTypesEnum";

export class AuthUserDTO{
    public readonly id!: string;
    public readonly email!: string;
    public readonly phoneNumber?:string;
    public readonly fullName!: string;
    public readonly userType!: UserTypeEnum;
    public readonly profilePicture?: string;
}