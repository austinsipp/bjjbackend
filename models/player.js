'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Player extends Model {

    };
    Player.init({
        player_id: {
            type: DataTypes.SMALLINT,
            primaryKey: true,
            autoIncrement: true
        },
        player_name: DataTypes.STRING,
        player_school: DataTypes.STRING,
        player_belt: DataTypes.STRING,
        created_by: DataTypes.STRING,
        created_date: DataTypes.DATE
    }, {
        sequelize,
        /*underscored: true,*//*removed this because I don't like it. 
        It takes camelcase values (js convention) here in js and changes 
        them in the database to underscored, which is the sql convention. 
        I'd rather have it just literally match the database and not have to 
        do a conversion and risk not matching*/
        timestamps: false,
        modelName: 'Player',
        freezeTableName: true
    });
    return Player;
};