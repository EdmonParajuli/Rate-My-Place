import * as Sequelize from "sequelize";
import { Database } from "../config";
import { CategoryModelInterface } from "../interfaces/categoryInterface";

const sequelize = Database.sequelize;

const Category = sequelize.define<CategoryModelInterface>(
    'providers_category',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        label: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        icon: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        coverImageUrl: {
            type: Sequelize.TEXT,
            allowNull: true,
            field: "cover_image_url"
        }
    },
    {
        tableName: "providers_category",
        paranoid: true,
        timestamps: true,
        underscored: true,
        freezeTableName: true
    }
)

export default Category;
