import * as Sequelize from 'sequelize';
import { Database } from "../config";
import { UserModelInterface } from "../interfaces";
import { UserTypeEnum } from '../enums/userTypesEnum';


const sequelize = Database.sequelize;

const User = sequelize.define<UserModelInterface>(
    'providers_users',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        fullName: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'full_name',
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
              isEmail: true,
            },
        },
        passwordHash:{
            type: Sequelize.STRING,
            allowNull: false,
            field: 'password_hash',
        },
        phoneNumber: {
            type: Sequelize.STRING,
            field: 'phone_number',
        },
        profilePicture: {
            type: Sequelize.TEXT,
            field: 'profile_picture',
            allowNull: true
        },
        coverPicture: {
            type: Sequelize.TEXT,
            field: 'cover_picture',
            allowNull: true
        },
        userType: {
            type: Sequelize.ENUM(
                UserTypeEnum.REGULAR,
                UserTypeEnum.BUSINESS
            ),
            allowNull: false,
            defaultValue: UserTypeEnum.REGULAR,
            field: 'user_type',
        }
    },
    {
        tableName: 'providers_users',
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
    }
)

export default User;